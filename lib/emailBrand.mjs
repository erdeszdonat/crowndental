const signature = '<div style="max-width:620px;margin:18px auto;text-align:center"><img src="https://www.crowndental.hu/brand/crown-dental.jpg" width="84" height="84" alt="Crown Dental" style="width:84px;height:84px;display:inline-block;border:0"></div>';

// Append the mark so the message's own preheader stays first in the inbox.
export function withCrownSignature(html) {
  return html + signature;
}
