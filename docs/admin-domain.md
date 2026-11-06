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


## Staff access (6 November 2026)

`/crown-dental` accepts the retained owner username/password or an invited colleague's email/password. The new **Kollégák** panel is admin-only. Creating invitations, changing roles, disabling users and requesting password resets require the acting administrator's current password. The owner account is separate and cannot be modified by these actions. An administrator cannot demote, disable or reset their own account through this panel.

- Assistants receive only appointment/patient data, with existing confirmation, cancellation and notes workflows. No HR, quote leads, marketing, blog, event or statistics data is returned to them.
- Invited admins receive the existing full dashboard plus colleague management.
- Invitations and reset links expire after 24 hours, are single use, and are replaced atomically on resend. The token lives in the email URL fragment, is removed from browser history when opened and is stored only as a SHA-256 hash in the database. Opening or previewing a link does not consume it.
- Colleagues choose a name and a 12–128 character password. Supabase Auth handles password hashing; passwords are never listed, logged or mailed. Password recovery sends a fresh setup link, suspends the account and invalidates older sessions.
- Role membership is stored in `staff_members`, not user-editable JWT metadata. Staff requests use the publishable key and the verified user's JWT, so database RLS applies to their actual reads and mutations. Membership and `auth.sessions` are checked on every request; role changes, disablement, reset and logout are enforced before JWT expiry. Staff sessions have an absolute eight-hour lifetime.
- `staff_invitations` and `staff_audit_log` are service-only, with RLS enabled and no client policies. The corresponding Supabase informational "RLS enabled no policy" notices are intentional. Staff cannot promote themselves or write membership rows. Patient update grants are limited to workflow columns, with no direct delete or insert grant.
- The temporary owner login retains its server-side privileged access. It uses an independent random `ADMIN_SESSION_SECRET` (required in production), not the password, for eight-hour signed cookies. Production and preview use separate secret values. Its old sessions must sign in again after this release.

All cookies are host-only, HttpOnly and SameSite=Strict; production staff cookies also use the `__Host-` prefix and Secure. Mutations require the exact Origin and ignore forwarded-host spoofing. API responses are no-store. The admin host suppresses referrers and indexing.

Two migrations remove the prior anonymous SELECT policies on appointments, HR and quote leads, then add staff roles and invitations. Public intake endpoints continue using their existing server credentials; no patient records are migrated or deleted. Apply the migrations before deploying the app. Required Vercel configuration: existing Supabase URL, publishable key, service key, Resend key and owner credentials, plus the new independent signing secret.

### Verification

Run `node --test tests/*.test.mjs` and `next build --webpack`. The tests use isolated provider/database mocks and never send mail. `tests/staff-rls.sql` verifies actual database roles, column grants, metadata forgery, promotion/demotion, disabled and revoked sessions, expiry and invitation replacement, using synthetic rows inside a transaction that ends in ROLLBACK. No real patient row is returned or altered.

Do not send sample invitations to real addresses or submit fake patient requests during release checks. Email delivery is reported as provider acceptance, not guaranteed inbox delivery. Database security checks do not constitute an independent penetration test or a claim of absolute security.
