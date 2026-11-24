export const patientGuideLinks = {
  itop: { slug: "fogmosas-fogszabalyzoval-itop-szajapolas", label: "Fogmosás fogszabályzóval – útmutató a bracketek körüli tisztításhoz" },
  voucher: { slug: "fogaszati-ajandekutalvany-karacsonyra-milyen-osszeget-valasszak", label: "Milyen összegű karácsonyi fogászati utalványt válasszak?" },
  orthodontics: { slug: "fogszabalyozas-koronaval-vagy-implantatummal", label: "Fogszabályozás koronával vagy implantátummal" },
  dentures: { slug: "mozog-a-kiveheto-fogsor-alabeleles-vagy-uj-fogsor", label: "Mozog a fogsora? Mikor segíthet az alábélelés?" },
  filling: { slug: "kiesett-a-fogtomes-mit-tegyek", label: "Kiesett a fogtömése? Teendők a vizsgálatig" },
} as const;

type GuideLink = (typeof patientGuideLinks)[keyof typeof patientGuideLinks];

export const relatedPatientGuides: Readonly<Record<string, GuideLink | undefined>> = {
  "lathatatlan-sin-vagy-rogzitett-fogszabalyozo-felnottkorban": patientGuideLinks.itop,
  "ragyogo-mosoly-egy-ora-alatt-igy-mukodik-a-valodi": patientGuideLinks.voucher,
  "a-fogszabalyozas-menete-modszerek-es-arak-attekintese-crown-dental": patientGuideLinks.orthodontics,
  "cuppanos-fogsor-arak-2026-ban-mennyibe-kerul-egy-stabil-kiveheto-fogsor": patientGuideLinks.dentures,
  "fogaszati-ugyelet-esztergomban-2026": patientGuideLinks.filling,
};
