// Shared by the local preview, the checkout service and the mail attachment.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./vendor/fontkit.umd.min.js'), require('./vendor/recipient-font.js'));
  } else root.CrownVoucher = factory(root.fontkit, root.crownRecipientFont);
})(globalThis, function (fontkit, recipientFont) {
  let fontBytes, typeface;
  function recipientName(value) {
    if (value == null || value === '') return '';
    if (typeof value !== 'string' || /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(value))
      throw new Error('A megajándékozott nevét egy sorban adja meg.');
    const name = value.trim().normalize('NFC').replace(/ +/g, ' ');
    if (!name) return '';
    if (name.length > 60) throw new Error('A név legfeljebb 60 karakter lehet.');
    if (!typeface) {
      fontBytes = Uint8Array.from(atob(recipientFont), char => char.charCodeAt(0));
      typeface = fontkit.create(fontBytes);
    }
    if (!Array.from(name).every(char => typeface.hasGlyphForCodePoint(char.codePointAt(0))))
      throw new Error('A megadott névben nem nyomtatható karakter van. Kérjük, írja át a nevet.');
    return name;
  }
  const calendar = new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Budapest', year:'numeric', month:'2-digit', day:'2-digit'});
  const dateFormat = new Intl.DateTimeFormat('hu-HU', {timeZone:'UTC',dateStyle:'long'});
  const day = time => calendar.format(new Date(time));
  const dateLabel = iso => dateFormat.format(new Date(iso+'T12:00:00Z'));
  function fromDateLabel(iso) {
    const n = Number(iso.slice(-2));
    const suffix = n === 1 ? 'jétől' : [3,6,8,13,16,18,20,23,26,28,30].includes(n) ? 'tól' : 'től';
    return dateLabel(iso).replace(/\.$/, '') + '-' + suffix;
  }
  function pickupFrom(issuedAt) {
    const d = new Date(day(issuedAt)+'T12:00:00Z');
    d.setUTCDate(d.getUTCDate()+3);
    return d.toISOString().slice(0,10);
  }
  function expiry(issuedAt) {
    const [y,m,d] = day(issuedAt).split('-').map(Number);
    return new Date(Date.UTC(y+1,m-1,Math.min(d,new Date(Date.UTC(y+1,m,0)).getUTCDate()))).toISOString().slice(0,10);
  }
  function canCollect(order, now=Date.now()) {
    const today = day(now);
    return order.delivery==='pickup' && !order.collectedAt && !order.redeemedAt && !order.reversed
      && today>=pickupFrom(order.issuedAt) && today<=order.expiry;
  }
  async function render(pdf, template, order, sample) {
    if (!Number.isInteger(order.amount) || order.amount<10000 || order.amount>500000 || order.amount%5000 ||
        !/^[A-HJ-NP-Z2-9]{20}$/.test(order.code) || order.expiry!==expiry(order.issuedAt)) {
      throw new Error('Az utalvány mentett adatai hibásak.');
    }
    const doc=await pdf.PDFDocument.load(template,{updateMetadata:false});
    const [page]=doc.getPages();
    if(doc.getPageCount()!==1 || Math.abs(page.getWidth()-595.276)>0.1 || Math.abs(page.getHeight()-419.528)>0.1)
      throw new Error('Az utalványsablon mérete eltér az eredeti A5-östől.');
    const serif=await doc.embedFont(pdf.StandardFonts.TimesRoman);
    const mono=await doc.embedFont(pdf.StandardFonts.CourierBold);
    const sans=await doc.embedFont(pdf.StandardFonts.Helvetica);
    function field(value,x,top,size,font,right=false){
      if(right) x-=font.widthOfTextAtSize(value,size);
      page.drawText(value,{x,y:page.getHeight()-top,size,font,color:pdf.rgb(.267,.208,.145)});
    }
    const name = recipientName(order.recipientName);
    if (name) {
      doc.registerFontkit(fontkit);
      const font = await doc.embedFont(fontBytes, {subset:true});
      const width = 238;
      const fitted = Math.min(17, width / font.widthOfTextAtSize(name,1));
      if (fitted >= 9) field(name,39.685,261.78,fitted,font);
      else {
        const chars = Array.from(name);
        const middle = Math.floor(chars.length / 2);
        const spaces = chars.map((c,i) => c === ' ' ? i : -1).filter(i => Math.abs(i-middle)<chars.length/5 && i>0);
        const split = spaces.sort((a,b) => Math.abs(a-middle)-Math.abs(b-middle))[0] ?? middle;
        const lines = [chars.slice(0,split).join('').trim(),chars.slice(split).join('').trim()];
        const size = Math.min(12, ...lines.map(line => width/font.widthOfTextAtSize(line,1)));
        lines.forEach((line,i) => field(line,39.685,252+i*13,size,font));
      }
    }
    field(new Intl.NumberFormat('hu-HU').format(order.amount).replace(/[\u00a0\u202f]/g,' '),526,261.78,19,serif,true);
    field(dateLabel(day(order.issuedAt)),39.685,327,11.5,serif);
    field(dateLabel(order.expiry),206.929,327,11.5,serif);
    field(order.code.match(/.{5}/g).join('-'),374.173,327,10.5,mono);
    if(sample) field('MINTA · NEM BEVÁLTHATÓ',555.59,351,6.9,sans,true);
    doc.setTitle('Crown Dental · Karácsonyi ajándékutalvány'+(sample?' · Minta':''));
    doc.setModificationDate(new Date(order.issuedAt));
    return doc.save();
  }
  return {day,dateLabel,fromDateLabel,expiry,pickupFrom,canCollect,recipientName,render};
});
