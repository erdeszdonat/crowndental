# Crown Dental utalványteszt

A vásárlói oldal ezen a Macen a http://127.0.0.1:8790 címen fut. A nyilvános honlap külön működik.

## Indítás

Node.js 24+, a Stripe CLI és a mappában telepített Stripe-csomag szükséges. Új gépen a függőségeket a `pnpm install --frozen-lockfile` paranccsal lehet telepíteni. Itt a `python3 start.py` egy helyi szervert indít, és továbbítja hozzá a Stripe teszteseményeit. A rejtett kérdéshez adható meg az aktuális szerveroldali tesztkulcs. A program ezt a futás idejére memóriában tartja. A Ctrl+C leállítja a próbát.

A vásárláshoz a Stripe oldalán tesztkártya használható. Például a `4242 4242 4242 4242` kártyaszám, jövőbeli lejárat és tetszőleges háromjegyű CVC. Az adminisztráció saját helyi megnyitási címét a `.sandbox/admin-url.txt` tartalmazza. A tesztadatok ebben a mappában, az `orders.sqlite` fájlban találhatók. Az automatikus ellenőrzések a `node --test sandbox.test.mjs` paranccsal futnak.

## A fizetéstől a beváltásig

A Crown Dental oldalán a vásárló megadja a számlázási adatokat, és 30 000–500 000 Ft között, 5 000 Ft-os lépésekben választ értéket. A szerver menti a rendelést, majd elmenti hozzá a Stripe által visszaadott fizetési azonosítót. A sikeres fizetést, a pénznemet és az összeget aláírt Stripe-értesítés vagy a Stripe-tól visszaolvasott állapot alapján ellenőrzi. A beállítások és az indulási teendők az [integrációs útmutatóban](../../../STRIPE_INTEGRATION_TODO.md) találhatók.

A kiadott kód 20 karakteres. A szerver budapesti dátummal számolja az egyéves érvényességet és egyetlen beváltást enged. Fizikai átvételnél az átadást külön lehet rögzíteni. Visszatérítés esetén a rendszer felfüggeszti a beváltást.

A vásárló a saját tesztrendeléséhez letöltheti az A5-ös minta-PDF-et. A számlázás, az e-mailes PDF-kézbesítés és a személyes átvétel feladatai a helyi nyilvántartásba kerülnek. A Számlázz.hu próbakiállítása és az e-mailes kézbesítés külön bekötést igényel. A nyilvános értékesítés előtt a Crown Dental saját utalványának elfogadhatóságát is tisztázni kell a Stripe-pal.

[Stripe Checkout](https://docs.stripe.com/checkout/fulfillment) · [Tesztkártyák](https://docs.stripe.com/testing) · [Utalványokkal kapcsolatos Stripe-feltételek](https://stripe.com/en-hu/legal/restricted-businesses#non-fiat-currency-and-stored-value)
