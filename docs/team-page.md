# Kollégáink

A nyilvános oldal: `/kollegaink`, illetve `/en/kollegaink`, `/sk/kollegaink`, `/de/kollegaink`.

Az adminban a **Kommunikáció → Kollégáink oldal** menüpont kezeli a nyilvános profilokat. A **Beállítások → Kollégák** továbbra is a belépési jogosultságok helye. Az asszisztensek a csapatszerkesztőhöz és annak API-jához nem férnek hozzá.

## Tartalom

- Sanity-típus: `crownTeamMember`.
- Csoportok: fogorvos, fogászati asszisztens, dentálhigiénikus, vezetőség.
- A vezetőség a nyilvános oldalon és az adminlistában a többi csoport után szerepel.
- A vezető egyetlen dokumentum: `crownTeam.professional-lead`.
- A név és a munkakör közös, a megnevezés és a bemutatkozás négy nyelven szerkeszthető. Hiányzó fordításnál magyar szöveg jelenik meg.
- Az új profil alapból nem jelenik meg a weboldalon. A `Megjelenik a weboldalon` kapcsoló és a mentés teszi ki; nyilvános profilhoz fénykép szükséges.
- A kisebb sorrendszám kerül előre a saját csoportban. Azonos számnál névsor dönt.
- Elrejtéskor a profil és a kép megmarad. A képfókusz és a kivágás a Studio felületén is beállítható.
- A Studio `liveEdit` módot használ; a nyilvános megjelenést az `isVisible` mező szabályozza. Ez weboldali megjelenési állapot, nem adatkészlet-hozzáférési jogosultság.

## Működés és ellenőrzés

A `SANITY_WRITE_TOKEN` kizárólag a szerveren használatos. Az admin API minden kérésnél a meglévő, MFA-val védett adminjogosultságot ellenőrzi; az írások az eredetet, a sebességkorlátot, a mezőket és a dokumentum típusát is ellenőrzik. A Sanity-revízió megakadályozza egy másik szerkesztő módosításának észrevétlen felülírását.

A pontot tartalmazó Sanity-azonosítók hitelesített lekérést igényelnek. A nyilvános oldal szerveroldali, rögzített lekérdezése ezért a `SANITY_READ_TOKEN`, ennek hiányában a meglévő `SANITY_WRITE_TOKEN` használatával olvas; csak az `isVisible == true` profilokat adja tovább, piszkozatokat és verziókat kizárva. A token nem kerül a böngészőbe. A hitelesített lekérés is a csapathoz tartozó, 5 perces gyorsítótárat használja.

A böngésző a fényképet legfeljebb 1600 pixelesre méretezi. A szerver legfeljebb 3 MB-os JPG/PNG/WebP képet fogad, a fájl fejlécét is ellenőrizve. A nyilvános oldal szerveroldali, 5 perces gyorsítótárral. A saját admin mentése érvényteleníti a csapat gyorsítótárát; Studio-módosítás legfeljebb a következő 5 perces újraellenőrzéskor látszik.

Automatizált ellenőrzés: `node --test tests/team.test.mjs`. A helyi teljes folyamat tesztelhető hamis szolgáltatóval: kizárólag `NODE_ENV=development` esetén a `CROWN_TEAM_DEV_API_ORIGIN` HTTP-s `localhost` vagy `127.0.0.1` eredetre állítható. Éles módban ez a beállítás figyelmen kívül marad, minden kérés a valódi Sanity API-ra megy. Teszteléshez ne használj éles írási tokent vagy valódi személyek adatlapját.
