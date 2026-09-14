# Website measurement and verification

Updated: 2026-09-14

## Scope

The homepage, treatment index, all 13 treatment pages and booking flow share `app/site-system.css`. Hungarian, English, German and Slovak are covered. Treatment images are fetched on the server through one shared weekly cached Sanity query, not separately in each visitor's browser. Existing prices, medical content and booking API are preserved.

## Consent and privacy

Optional analytics runs only on `crowndental.hu` and `www.crowndental.hu`, after analytics consent. Local development and preview hosts do not send analytics. Revocation disables the GA tag and clears session attribution.

Custom events contain no name, email, telephone number, treatment selection, free text, booking identifier or URL query string. Page names use an allowlist; individual blog slugs are grouped as `blog`. Booking attribution expires after 30 minutes. This measures consenting visitors, not all patients or all website traffic.

## Event definitions

| Event | Meaning |
| --- | --- |
| `booking_cta_click` | Booking link clicked; includes its location and source page. |
| `phone_click` | Telephone link clicked; not a completed call. |
| `booking_form_view` | Booking form shown after consent. |
| `booking_start` | First interaction with the booking form. |
| `booking_step_view` | A form step shown. |
| `booking_step_complete` | A form step passed client validation. |
| `booking_submit` | Submission attempted. |
| `booking_success` | Booking API returned a successful response. This means an accepted request, not a confirmed appointment or an attended visit. |
| `booking_error` | Submission failed; includes a coarse technical error category. |
| `booking_validation_error` | Client-side validation failed. |

GA4 property `533215877`, web stream `14379018783`, measurement ID `G-9BS3P1DC4T`.

Registered event-scoped custom dimensions: `site_language`, `booking_source`, `booking_step`, `cta_location`, `error_type`. `booking_success` is a key event, counted once per event, without an assumed monetary value. Automatic form-interaction measurement is disabled; automatic page views and history-based page views remain enabled. Do not add a second manual page-view sender.

For funnel analysis, compare form view → start → step 2 → submit → success using a GA4 funnel exploration and break down by language and source. Compare consistent date ranges and adequate sample sizes; raw event totals can include repeated interactions. Missing historical measurement cannot be reconstructed from this fix.

## Verification

```sh
npm test
npm run build
# Against a local production server on port 3005:
node tests/route-smoke.mjs
```

The analytics tests verify consent, revocation, the required `gtag` Arguments protocol, preview exclusions, attribution expiry and private-data filtering. Route smoke tests verify 68 localized pages, including server-rendered treatment images and price sections. Browser checks additionally cover mobile/tablet/desktop layout, navigation, required fields, step navigation and preservation of entered values.

Do not send a fake booking to production to verify tracking. Test successful API delivery only in a controlled environment or during an authorized genuine booking; the local failure path is safe to test with integration credentials absent.

## Vercel usage

ISR usage must be checked in the Vercel usage dashboard for this project and matching complete date ranges. Runtime request counts are not unique visitors. A decrease in daily writes does not free an already-consumed monthly allowance. Recheck the next complete days after a deployment and distinguish traffic changes, builds and invalidations from changes in cache efficiency.
