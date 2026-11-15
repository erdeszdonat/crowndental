import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const read = (f) =>
  fs.readFileSync(new URL("../" + f, import.meta.url), "utf8");
const cache = new Map();
function load(file, imports = {}, globals = {}) {
  const m = { exports: {} };
  const code = ts.transpileModule(read(file), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(code, {
    module: m,
    exports: m.exports,
    Request,
    Response,
    URL,
    Date,
    console: { error() {}, warn() {} },
    process: {
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid",
        SUPABASE_SERVICE_ROLE_KEY: "fixture",
      },
    },
    require: (n) => {
      if (n in imports) return imports[n];
      if (n.startsWith("./") || n.startsWith("@/lib/")) {
        const f =
          "lib/" + n.replace(/^\.\//, "").replace(/^@\/lib\//, "") + ".ts";
        if (!cache.has(f)) cache.set(f, load(f));
        return cache.get(f);
      }
      throw Error("Unmocked " + n);
    },
    ...globals,
  });
  return m.exports;
}
const cards = load("lib/nfcCards.ts"),
  clinics = load("lib/appointmentClinics.ts"),
  copy = load("lib/nfcCopy.ts");
test("personal and clinic cards enforce the professional/clinic mapping and treatment allowlist", () => {
  for (const c of cards.NFC_CARDS) {
    for (const treatment of Object.keys(cards.HYGIENE_TREATMENTS)) {
      const r = cards.resolveNfcBooking(c.id, c.hygienistId, treatment);
      assert.equal(r.requested_clinic_id, c.clinicId);
      assert.equal(r.requested_hygienist_id, c.hygienistId);
    }
  }
  assert.equal(
    cards.resolveNfcBooking("belvaros", "wierl-eva", "fogfeherites")
      .requested_hygienist_id,
    "wierl-eva",
  );
  assert.equal(
    cards.resolveNfcBooking("belvaros", null, "fogekszer")
      .requested_hygienist_id,
    null,
  );
  for (const args of [
    ["ujvari-lili", "wierl-eva", "fogfeherites"],
    ["primas-sziget", "ujvari-lili", "fogfeherites"],
    ["bad", null, "fogfeherites"],
    ["belvaros", null, "toString"],
    ["belvaros", "bad", "fogfeherites"],
  ])
    assert.equal(cards.resolveNfcBooking(...args), null);
});
function booking({ existing = null, mailOk = true, deny = false } = {}) {
  const inserts = [],
    emails = [],
    queries = [];
  let current = existing;
  const db = {
    from: (table) => {
      queries.push(table);
      const q = {
        insert: (row) => {
          inserts.push(row);
          current = { ...row, id: 123 };
          return q;
        },
        select: () => q,
        eq: () => q,
        single: async () =>
          existing ? { error: { code: "23505" } } : { data: { id: 123 } },
        maybeSingle: async () => ({ data: existing }),
        update: () => ({ eq: async () => ({ error: null }) }),
      };
      return q;
    },
  };
  const security = {
    rejectUntrustedMutation: () =>
      deny ? Response.json({}, { status: 403 }) : null,
    enforceRateLimit: async () => null,
    claimIdempotency: () => true,
    getIdempotencyKey: () => "nfc-test",
    completeIdempotency: () => {},
    releaseIdempotency: () => {},
    cleanText: (v, n) => (typeof v === "string" ? v.slice(0, n) : ""),
    normalizeLocale: (v) => (["hu", "en", "sk", "de"].includes(v) ? v : "hu"),
    normalizeEmail: (v) => v,
    isValidEmail: (v) =>
      typeof v === "string" && v.endsWith("@example.invalid"),
    isValidPhone: () => true,
    noStoreJson: (v, i) => Response.json(v, i),
  };
  const api = load("app/api/book-appointment/route.ts", {
    "@supabase/supabase-js": { createClient: () => db },
    "@/lib/nfcCards": cards,
    "@/lib/nfcCopy": copy,
    "@/lib/appointmentClinics": clinics,
    "@/lib/analyticsServer": { captureAnalyticsSession: async () => null },
    "@/lib/bookingAvailability": {
      isBudapestBookingAvailable: () => false,
      isBudapestCity: (v) => v === "Budapest",
    },
    "@/lib/addToAudience": {
      sendTransactionalEmail: async (p) => {
        emails.push(p);
        return { ok: mailOk };
      },
    },
    "@/lib/marketingSubscribers": {
      upsertMarketingSubscriber: () => {
        throw Error("unexpected marketing");
      },
    },
    "@/lib/names": { getPreferredGreetingName: (n) => n },
    "@/lib/marketingTokens": {
      createAppointmentConsentToken: () => "fixture-token",
    },
    "@/lib/serverSecurity": security,
  });
  const run = async (overrides = {}) =>
    api.POST(
      new Request("https://www.crowndental.hu/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Fixture <script>",
          phone: "+36123456789",
          email: "fixture@example.invalid",
          city: "Esztergom",
          treatment: "Fake client label",
          locale: "hu",
          nfcCardId: "berber-waller-oxana",
          requestedHygienistId: "berber-waller-oxana",
          hygieneTreatmentId: "fogfeherites",
          privacyAcknowledged: true,
          ...overrides,
        }),
      }),
    );
  return {
    run,
    inserts,
    emails,
    queries,
    get stored() {
      return current;
    },
  };
}
test("booking stores canonical source/professional/clinic separately without analytics consent in all locales", async () => {
  for (const locale of ["hu", "en", "sk", "de"]) {
    const e = booking();
    const r = await e.run({
      locale,
      city: "Budapest",
      requestedClinicId: "belvaros",
    });
    assert.equal(r.status, 200);
    assert.equal(e.inserts.length, 1);
    const saved = e.inserts[0];
    assert.equal(saved.nfc_card_id, "berber-waller-oxana");
    assert.equal(saved.requested_hygienist_id, "berber-waller-oxana");
    assert.equal(saved.requested_clinic_id, "primas-sziget");
    assert.equal(
      saved.treatment,
      cards.HYGIENE_TREATMENTS.fogfeherites[locale],
    );
    assert.equal(saved.analytics_session_id, null);
    assert.equal(saved.city, "Esztergom");
    const html = e.emails[0].html;
    assert.ok(html.includes("Berber-Waller Oxána"));
    assert.ok(html.includes("Helischer"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(html.indexOf("+36706042500") < html.indexOf("+36305892468"));
  }
});
test("forged card/provider, invalid treatment and missing privacy acknowledgement are rejected before DB", async () => {
  for (const override of [
    { nfcCardId: "invalid" },
    { requestedHygienistId: "ujvari-lili" },
    { hygieneTreatmentId: "implant" },
    { privacyAcknowledged: false },
  ]) {
    const e = booking();
    assert.equal((await e.run(override)).status, 400);
    assert.equal(e.queries.length, 0);
    assert.equal(e.emails.length, 0);
  }
  const e = booking({ deny: true });
  assert.equal((await e.run()).status, 403);
  assert.equal(e.queries.length, 0);
});
test("ordinary bookings remain unchanged and failed receipt delivery never loses the saved NFC request", async () => {
  const normal = booking();
  assert.equal((await normal.run({ nfcCardId: undefined })).status, 200);
  assert.equal(normal.inserts[0].nfc_card_id, undefined);
  assert.equal(normal.inserts[0].treatment, "Fake client label");
  const first = booking({ mailOk: false });
  const data = await (await first.run()).json();
  assert.equal(data.success, true);
  assert.equal(data.emailSent, false);
  const retry = booking({ existing: first.stored });
  const result = await (await retry.run()).json();
  assert.equal(result.success, true);
  assert.equal(retry.emails.length, 1);
  assert.ok(retry.emails[0].html.includes("Berber-Waller Oxána"));
});
test("NFC report requires admin MFA/origin and validates dates before its service-only RPC", async () => {
  const dates = load("lib/analyticsDates.ts");
  let calls = 0;
  for (const denied of ["origin", "auth", "none"]) {
    const route = load("app/api/admin/nfc/route.ts", {
      "@/lib/staffAuth": {
        requireStaffOrigin: () =>
          denied === "origin" ? Response.json({}, { status: 403 }) : null,
        authorizeStaff: async (_, role) => {
          assert.equal(role, "admin");
          return denied === "auth"
            ? { error: Response.json({}, { status: 403 }) }
            : { error: null };
        },
        staffServiceClient: () => ({
          rpc: async (name, args) => {
            calls++;
            assert.equal(name, "admin_nfc_report");
            assert.equal(args.p_from, "2020-01-01");
            return { data: { cards: [] } };
          },
        }),
      },
      "@/lib/serverSecurity": { noStoreJson: (v, i) => Response.json(v, i) },
      "@/lib/analyticsDates": dates,
    });
    const response = await route.POST(
      new Request("https://admin.crowndental.hu/api/admin/nfc", {
        method: "POST",
        body: JSON.stringify({ from: "2020-01-01", to: "2020-01-01" }),
      }),
    );
    assert.equal(response.status, denied === "none" ? 200 : 403);
    if (denied === "none") {
      assert.equal(
        (
          await route.POST(
            new Request("https://admin.crowndental.hu/api/admin/nfc", {
              method: "POST",
              body: JSON.stringify({ from: "2020-02-31", to: "2099-01-01" }),
            }),
          )
        ).status,
        400,
      );
    }
  }
  assert.equal(calls, 1);
});
test("card routes are allowlisted in analytics while patient paths are discarded", () => {
  const analytics = load("lib/siteAnalytics.ts"),
    validation = load("lib/analyticsValidation.ts");
  for (const c of cards.NFC_CARDS) {
    assert.equal(
      analytics.measurementPage("/de/kartya/" + c.id),
      "kartya/" + c.id,
    );
    assert.ok(validation.PUBLIC_PAGES.has("kartya/" + c.id));
  }
  assert.equal(analytics.measurementPage("/kartya/private-patient"), "other");
  assert.equal(
    analytics.measurementPage("/kartya/ujvari-lili?email=private"),
    "kartya/ujvari-lili",
  );
});

test("persistent booking buttons keep every localized NFC card in its own form", () => {
  for (const locale of ["", "/hu", "/en", "/sk", "/de"])
    for (const card of cards.NFC_CARDS)
      assert.equal(
        cards.isNfcCardPath(locale + "/kartya/" + card.id + "/"),
        true,
      );
  for (const path of [
    "/kartya/unknown",
    "/kartya/ujvari-lili/extra",
    "/idopont",
    "/kartya",
  ])
    assert.equal(cards.isNfcCardPath(path), false);
});
