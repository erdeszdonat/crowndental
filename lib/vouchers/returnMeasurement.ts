import { ANALYTICS_READY_EVENT, VOUCHER_RECEIPT_KEY, canMeasure, trackVoucherEvent } from '../siteAnalytics';

export function startVoucherReturnMeasurement() {
  let timer: number | undefined;
  let running = false;
  const controller = new AbortController();
  const delays = [1500, 3500, 7500, 15000, 30000];
  let retries = 0;
  async function verify() {
    if (running || controller.signal.aborted || !canMeasure()) return;
    running = true;
    try {
      const receipt = window.sessionStorage.getItem(VOUCHER_RECEIPT_KEY);
      if (!receipt) return;
      const response = await fetch('/api/utalvany/meres', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt }), signal: controller.signal,
      });
      if (controller.signal.aborted || !canMeasure()) return;
      if (response.status === 202 || response.status === 503) {
        if (retries < delays.length) timer = window.setTimeout(verify, delays[retries++]);
        return;
      }
      if (!response.ok) return;
      const { value, transaction } = await response.json();
      if (controller.signal.aborted || window.sessionStorage.getItem(VOUCHER_RECEIPT_KEY) !== receipt) return;
      if (trackVoucherEvent('purchase', value, transaction))
        window.sessionStorage.removeItem(VOUCHER_RECEIPT_KEY);
    } catch { /* Checkout and delivery are independent of optional measurement. */ }
    finally { running = false; }
  }
  void verify();
  window.addEventListener(ANALYTICS_READY_EVENT, verify);
  return () => {
    controller.abort();
    window.clearTimeout(timer);
    window.removeEventListener(ANALYTICS_READY_EVENT, verify);
  };
}
