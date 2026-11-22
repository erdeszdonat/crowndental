# Crown Dental ajándékutalvány · Stripe Checkout

## Vásárlási értékek

A meglévő egyszeri fizetés, a forintban számolt utalványtétel és mindkét visszatérési cím ki van töltve. A tesztoldal sikeres visszatérési címében a `{CHECKOUT_SESSION_ID}` a Stripe által vásárláskor behelyettesített azonosító. A termék ára a szerveren ellenőrzött névértékből készül. A két megvalósítás a [webes fizetési végpontban](app/api/utalvany/checkout/route.ts) és a [helyi tesztoldal paramétereiben](prototypes/karacsonyi-utalvanyok/sandbox/orders.mjs) található.

Az éles sikeres visszatérés útvonala `/karacsonyi-utalvanyok?visszateres=1`, a megszakított fizetésé `/karacsonyi-utalvanyok`, mindkettő a `www.crowndental.hu` címen.

## Beállított paraméterek

| Checkout Studio mező | Érték |
|---|---|
| `mode` | `payment` |
| `ui_mode` | `hosted_page` (Stripe Node SDK 23.2.0) |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled`, `automatic_tax.enabled`, `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001` |
| `origin_context` | `web` |

A `payment_method_collection` mezőt a Studio útmutatója az előfizetésekhez írja elő. Az utalvány egyszeri vásárlás.

## Hogyan jut el az utalvány a vásárlóhoz?

1. A [vásárlási űrlap](app/[locale]/karacsonyi-utalvanyok/Purchase.tsx) bekéri a nevet vagy cégnevet, a kézbesítési e-mail-címet, a teljes számlázási címet és céges számlánál az adószámot. A szerver [ellenőrzi az adatokat](lib/vouchers/billing.mjs), majd a rendeléshez menti őket.
2. A szerver létrehozza a fizetést, és a Stripe fizetési oldalának megnyitása előtt menti a kapott Checkout Session azonosítót. Ugyanazon próbálkozás ismétlése ugyanahhoz a fizetéshez vezet.
3. Az [értesítési végpont](app/api/utalvany/webhook/route.ts) ellenőrzi a Stripe aláírását. A [feldolgozó](lib/vouchers/service.ts) az elmentett azonosító, a fizetési állapot, a pénznem és az összeg alapján adja ki az utalványt. Az új megrendeléseknél a Resend és a Számlázz.hu a rendelésben mentett adatokat használja. Korábbi fizetésekhez a Stripe-nál korábban bekért adatok is feldolgozhatók. A visszatérítés a megfelelő rendelést zárolja.

## Zárt próba

- A webalkalmazás függőségei a projekt gyökeréből az `npm ci` paranccsal telepíthetők. A helyi Stripe-próbához használd a [tesztoldal indítási útmutatóját](prototypes/karacsonyi-utalvanyok/sandbox/README.md). A már futó tesztszervert az új kód használatához újra kell indítani.
- A helyi tesztszerver a `STRIPE_SECRET_KEY` tesztértékét használja. Az indító a Stripe CLI-től kapott `STRIPE_WEBHOOK_SECRET` értékével hitelesíti a tesztértesítést. A korábban chatben megosztott titkos tesztkulcsot cseréld le a Stripe kezelőfelületén.
- Tesztfizetéshez használható a `4242 4242 4242 4242` kártyaszám, jövőbeli lejárat és háromjegyű CVC. Használj kitalált számlázási adatokat. A helyi folyamatban a levél és a számla tesztfeladatként jelenik meg. [Stripe tesztkártyák](https://docs.stripe.com/testing)

## Élesítés

- Ellenőrizni kell a Stripe-fiókban a saját rendelőkben beváltható utalvány elfogadhatóságát és a legfeljebb 500 000 Ft-os névértéket. A forintban és kizárólag kártyával történő fizetéshez ellenőrizni kell a Dashboardban a kártyás fizetési módokat és ki kell kapcsolni az Adaptive Pricing funkciót. A minta ezeket a fiókbeállításokra bízza. [Stripe fizetési módok](https://dashboard.stripe.com/settings/payment_methods) · [Adaptive Pricing](https://dashboard.stripe.com/settings/adaptive-pricing)
- Az éles adatbázisba bekerült az [utalványtáblák migrációja](supabase/migrations/20261122220741_voucher_fulfillment.sql) a meglévő Supabase-kapcsolattal. A pénzügyi titkok csak szerveroldali beállításba kerüljenek. Az éles fizetési kulcs neve `STRIPE_SECRET_KEY`, az értesítés aláírókulcsáé `STRIPE_VOUCHER_WEBHOOK_SECRET`.
- A végpont telepítése után a Stripe eseménycélja `https://www.crowndental.hu/api/utalvany/webhook`. A saját fiók eseményeihez válaszd a `checkout.session.completed`, `checkout.session.async_payment_succeeded` és `charge.refunded` eseményeket. [Stripe eseménycélok](https://dashboard.stripe.com/workbench/webhooks)
- A Vercel Production környezetében a két Stripe-kulcs, a Resend- és a Számlázz.hu-kulcs szerepel. A rendelő által megadott beváltási kör alapján a beállított áfakód `VOUCHER_VAT_CODE=TAM`. Az utalvány mindkét Crown Dental rendelőben, bármely adómentes fogászati kezelésre beváltható. A recepció beváltás előtt ellenőrzi a kezelési tételt.
- Visszatérítésnél a rendszer letiltja a kódot. A rendeléshez tartozó számla helyesbítését vagy sztornózását a munkatárs ellenőrzi a Számlázz.hu-ban. Az online utalványvásárlás elállási feltételeit, valamint a félbehagyott rendelések számlázási adatainak megőrzési és törlési rendjét indulás előtt véglegesíteni kell.
- A jóváhagyott ÁSZF és adatkezelési tájékoztató tartalmazza az utalványvásárlást és az új számlázási űrlapot. Az asszisztens kóddal ellenőrizhet és beválthat. A rendelési lista, a nyomtatás és a kiadás az adminnak érhető el. Az oldal publikus, az éles fizetés kapcsolója `VOUCHER_SALES_ENABLED=true`. Az első vásárlásnál az azonos rendeléshez tartozó Stripe-fizetést, kézbesítési állapotot és számlaszámot kell egyeztetni.

További segítség a [Stripe ügyfélszolgálatán](https://support.stripe.com) és a [Stripe MCP útmutatójában](https://docs.stripe.com/mcp) érhető el.
