export const TEAM_ROLES = [
  "professional_lead",
  "dentist",
  "dental_assistant",
  "dental_hygienist",
] as const;
export const TEAM_LOCALES = ["hu", "en", "sk", "de"] as const;
export const TEAM_LEAD_ID = "crownTeam.professional-lead";
export const TEAM_TYPE = "crownTeamMember";
export type TeamRole = (typeof TEAM_ROLES)[number];
export type TeamLocale = (typeof TEAM_LOCALES)[number];
export type TeamText = Partial<Record<TeamLocale, string>>;
export type TeamPhoto = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; width: number; height: number };
};
export type TeamMember = {
  _id: string;
  _rev: string;
  _type: typeof TEAM_TYPE;
  name: string;
  role: TeamRole;
  title: TeamText;
  bio: TeamText;
  photo?: TeamPhoto;
  photoUrl?: string;
  displayOrder: number;
  isVisible: boolean;
};
export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  professional_lead: "Szakmai vezető",
  dentist: "Fogorvos",
  dental_assistant: "Fogászati asszisztens",
  dental_hygienist: "Dentálhigiénikus",
};
export function isTeamRole(value: unknown): value is TeamRole {
  return TEAM_ROLES.includes(value as TeamRole);
}
export function validTeamId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/.test(value) &&
    !value.startsWith("drafts.") &&
    !value.startsWith("versions.")
  );
}
export function localizedTeamText(
  value: TeamText | undefined,
  locale: TeamLocale,
) {
  return value?.[locale]?.trim() || value?.hu?.trim() || "";
}
function textFields(value: unknown, max: number): TeamText {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const fields: TeamText = {};
  for (const locale of TEAM_LOCALES) {
    const text = (value as Record<string, unknown>)[locale];
    if (text === undefined) continue;
    if (typeof text !== "string" || text.length > max)
      throw new Error("A szöveg túl hosszú vagy érvénytelen.");
    fields[locale] = text.replace(/\r\n?/g, "\n").trim();
  }
  return fields;
}
export function validateTeamInput(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("Érvénytelen adatlap.");
  const value = body as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  if (name.length < 2 || name.length > 120)
    throw new Error("A név 2–120 karakter hosszú legyen.");
  if (!isTeamRole(value.role)) throw new Error("Válasszon munkakört.");
  if (typeof value.isVisible !== "boolean")
    throw new Error("Érvénytelen megjelenési beállítás.");
  if (
    !Number.isInteger(value.displayOrder) ||
    Number(value.displayOrder) < 0 ||
    Number(value.displayOrder) > 9999
  )
    throw new Error("A sorrend 0–9999 közötti egész szám legyen.");
  let photo: TeamPhoto | undefined;
  if (value.photo !== undefined && value.photo !== null) {
    const image = value.photo as TeamPhoto;
    if (
      !image.asset ||
      typeof image.asset._ref !== "string" ||
      !/^image-[a-f0-9]{20,64}-[1-9][0-9]*x[1-9][0-9]*-(jpg|png|webp)$/.test(
        image.asset._ref,
      )
    )
      throw new Error("Töltsön fel érvényes fényképet.");
    photo = {
      _type: "image",
      asset: { _type: "reference", _ref: image.asset._ref },
    };
    if (image.crop) {
      const { top, bottom, left, right } = image.crop;
      if (
        ![top, bottom, left, right].every(
          (n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n < 1,
        ) ||
        top + bottom >= 1 ||
        left + right >= 1
      )
        throw new Error("Érvénytelen képkivágás.");
      photo.crop = { top, bottom, left, right };
    }
    if (image.hotspot) {
      const { x, y, width, height } = image.hotspot;
      if (
        ![x, y, width, height].every(
          (n) =>
            typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1,
        ) ||
        !width ||
        !height
      )
        throw new Error("Érvénytelen képfókusz.");
      photo.hotspot = { x, y, width, height };
    }
  }
  if (value.isVisible && !photo)
    throw new Error("A nyilvános adatlaphoz töltsön fel fényképet.");
  return {
    name,
    role: value.role,
    title: textFields(value.title, 160),
    bio: textFields(value.bio, 5000),
    displayOrder: Number(value.displayOrder),
    isVisible: value.isVisible,
    ...(photo ? { photo } : {}),
  };
}
export function teamImageType(
  bytes: Uint8Array,
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n))
    return "image/png";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}
