"""Read-only HTTP smoke check for paired, ordered clinic phone CTAs in all locales."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor
import json, sys

PHONES = ['tel:+36706042500', 'tel:+36305892468']
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class PhoneParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.groups=[]; self.primary=[]; self.ungrouped=[]; self.header=[]; self.booking=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        group = [] if 'data-clinic-phones' in attrs else None
        if group is not None:
            (self.primary if attrs.get('data-clinic-phones')=='primas-sziget' else self.groups).append(group)
            if any(t=='header' for t,_,_ in self.stack): self.header.append(group)
            if any('crown-booking-contact' in a.get('class','').split() for _,a,_ in self.stack): self.booking.append(group)
        if tag=='a' and attrs.get('href','').startswith('tel:'):
            enclosing=next((g for _,_,g in reversed(self.stack) if g is not None),None)
            if enclosing is None: self.ungrouped.append(attrs['href'])
            else: enclosing.append(attrs['href'])
        if tag not in VOID: self.stack.append((tag,attrs,group))
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag:
                del self.stack[i:]; break
    def handle_startendtag(self, tag, attrs): self.handle_starttag(tag,attrs); self.handle_endtag(tag)

origin=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:3016').rstrip('/')
pages=['','/idopont','/idopont/sikeres','/kapcsolat','/primas-sziget','/esztergom','/budapest','/kezelesek','/kezelesek/fogszabalyozas','/kezelesek/direkt-hej','/hollywood-mosoly','/kollegaink','/aszf','/adatkezeles','/cookie-tajekoztato']
paths=[(prefix+page or '/') for prefix in ('','/en','/sk','/de') for page in pages]
opening=json.loads((Path(__file__).parent.parent/'lib/openingContent.json').read_text())
paths += [('' if lang=='hu' else '/'+lang)+'/blog/'+copy['slug'] for lang,copy in opening.items()]
def verify(path):
    with urlopen(origin+path,timeout=45) as response:
        assert response.status==200,path
        html=response.read().decode()
    parser=PhoneParser(); parser.feed(html)
    assert len(parser.groups)>=2,(path,'missing phone groups')
    assert parser.header and all(g==PHONES for g in parser.header),(path,'header')
    assert all(g==PHONES for g in parser.groups),(path,'incorrect pair/order',parser.groups)
    assert all(g==PHONES[:1] for g in parser.primary),(path,'opening banner primary phone')
    if path in ('/','/en','/sk','/de'): assert len(parser.primary)==2,(path,'two opening banners')
    assert not parser.ungrouped,(path,'isolated phone CTA',parser.ungrouped)
    if path.endswith('/idopont'): assert parser.booking==[PHONES],(path,'phone booking help')
    assert 'MISSING_MESSAGE' not in html,path
    return len(parser.groups)
with ThreadPoolExecutor(max_workers=4) as executor:
    counts=list(executor.map(verify,paths))
print(json.dumps({'status':'passed','pages':len(paths),'locales':4,'phone_groups':sum(counts),'checks':'both clickable numbers, Prímás first, header, phone booking help, opening banners only new phone'},ensure_ascii=False))
