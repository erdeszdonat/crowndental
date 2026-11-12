# Admin analytics

Open `https://admin.crowndental.hu/crown-dental`, sign in with an administrator account and select **Elemzések**. Existing MFA and role checks apply. Assistants cannot read reports.

## Reporting

- Date presets include yesterday, full previous Monday–Sunday week, previous calendar month/year, and arbitrary inclusive date ranges (maximum ten years).
- All calendar boundaries use Europe/Budapest, including DST. Comparison is the preceding equal-length period, shown explicitly.
- Online requests are non-hidden appointment rows grouped by creation time. Confirmed means their **current** status is `processed`; `special` is not confirmed. This is not attendance or revenue reporting.
- Visitors are consented random browser identifiers (90-day lifetime); sessions expire after 30 minutes of inactivity. Foreground activity is sampled every 15 seconds; idle and hidden-tab time are excluded. No measurement can include users who decline consent or block delivery.
- Conversion uses distinct measured booking visitors / distinct measured visitors. Repeated requests by one visitor do not inflate the numerator. The ordered funnel is evaluated within the selected period and session.
- Source, medium and campaign are the first values of the current session. Sources for unmeasured bookings remain unknown. Phone clicks are not verified calls or bookings.
- Treatments and clinic breakdowns come from the protected appointment database. Public traffic events contain no form values or contact data.
- Daily charts, source/campaign/landing/device/language breakdowns, page groups, weekday/hour heatmap and CSV export share the selected date range. Legacy business statistics retain their own filters in a separate expandable section.

## Historical data

The original appointment database begins on 2026-04-16. Existing records have no retrospectively invented source attribution. First-party measurement begins on 2026-11-12 after deployment.

A one-time, server-side import from existing GA4 property `533215877` covers 2026-04-16 through 2026-11-11: 1,163 date/source/medium rows, 9,981 sessions. The report filtered hostname to crowndental.hu / www.crowndental.hu and used the property's Europe/Budapest timezone. This is an explicitly labeled snapshot, **not an ongoing GA API connection**. GA `booking_success` key events remain separate from database requests. No GA credentials are stored in this application.

## Campaign tagging

Use public, non-personal ASCII campaign tags, for example:

`https://www.crowndental.hu/primas-sziget?utm_source=facebook&utm_medium=paid_social&utm_campaign=primas-nyitas`

Never put patient identifiers or contact details into UTM parameters. Tags are limited to 80 characters from letters, numbers, `.`, `_`, `-`; seven consecutive digits are rejected. Raw URLs, search queries and click IDs are not stored. Known search/social referrers are categorized; unknown external referrers become `other-referral`.

## Security and operation

- `/api/admin/analytics` validates same-origin, live admin membership and MFA before using a service-role aggregate RPC.
- New tables and functions are service-only: RLS enabled; no public, anon or authenticated table/report privileges. No client database credentials were added.
- `/api/site-analytics` requires explicit analytics consent, exact same origin, production hostname, event allowlists, UUIDs, bounded payloads and rate limits. Preview/admin/bot traffic is ignored. Client events cannot claim booking success; successful conversion comes from saved appointments.
- Failed analytics capture cannot prevent booking submission. Event UUIDs and booking idempotency avoid retry duplication.
- The cookie policy version and all four language notices were updated. Withdrawal clears local identifiers and stops further collection. No session replay is enabled.
- `crown-analytics-retention` runs via existing pg_cron daily at 03:25 UTC. It deletes sessions/events older than 25 months and clears expired appointment attribution links; appointments themselves remain unchanged.

## Verification

Run `node --test tests/admin-analytics.test.mjs tests/site-analytics.test.mjs tests/appointment-confirmation.test.mjs tests/admin-session.test.mjs tests/admin-lists.test.mjs tests/staff-security.test.mjs` and a production Next build.

The database aggregate was additionally tested inside a rolled-back transaction: Budapest DST day boundaries, two requests from one visitor, processed vs special status, and correctly ordered form steps. No test appointments or sessions remain. Browser checks covered previous month, a single custom day, a custom nine-day range, CSV download, and a 390px mobile viewport with no document overflow. Local UI verification used aggregate-only fixtures, never a production authentication bypass; all preview-only routes and fixtures were removed before release.
