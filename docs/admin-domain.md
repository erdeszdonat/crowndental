# Crown admin domain

The existing Crown Dental application also serves `admin.crowndental.hu`; it uses the same Vercel project and server-side backend credentials. No database, email template or Sanity dataset migration is involved.

- `/`: public brand chooser, before login, with Crown Dental and Beauty Crown logos.
- `/crown-dental`: existing Crown Dental login and dashboard.
- `/crown-dental/hidfutas`: existing event admin with the same authenticated APIs.
- `/beauty-crown`: informational placeholder only; no login or backend data access.
- The old public `/admin` and nested links redirect to the new admin domain. Public-host admin APIs return 421 rather than forwarding credential-bearing requests.
- Host-only HttpOnly, Secure, SameSite=Strict cookies stay scoped to the new host. Existing users must sign in again on the new hostname with their unchanged credentials.
- Sanity Studio and public article/event links stay at `www.crowndental.hu`.
- The admin host has noindex headers and a disallow-all robots file; public content and booking APIs are not duplicated there.

## Release

Add `admin.crowndental.hu` to the existing `crowndental` Vercel project. Set the authoritative DNS CNAME `admin` to the exact target returned by Vercel (currently `3bd70843f3a86b91.vercel-dns-017.com.`). Verify DNS and HTTPS before promoting the admin migration. Keep unrelated DNS, especially mail records, untouched.

Test a preview at `/admin/portal` and `/crown-dental`; local/preview hosts do not redirect to production. Keep the prior deployment available for rollback until the production hostname, login and old links have been checked.

## Verification

`node --test tests/*.test.mjs` includes routing, host isolation, secure session cookies, cross-origin rejection, existing appointment/email flows and public-site regressions. `next build --webpack` validates the full website. Start that build locally on port 3050, then run `node scripts/verify-admin-domain.mjs` for HTTP verification with distinct Host headers. The test uses no real credentials, sends no mail and reads no patient records.
