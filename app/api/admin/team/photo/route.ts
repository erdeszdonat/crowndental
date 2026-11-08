import { authorizeStaff, requireStaffOrigin } from "@/lib/staffAuth";
import { enforceRateLimit, noStoreJson } from "@/lib/serverSecurity";
import { teamImageType } from "@/lib/team";
import { teamClient } from "@/lib/teamServer";
export async function POST(request: Request) {
  const originError = requireStaffOrigin(request);
  if (originError) return originError;
  const access = await authorizeStaff(request);
  if (access.error) return access.error;
  const limit = await enforceRateLimit(request, "team-photo", {
    limit: 25,
    windowMs: 15 * 60_000,
    key: access.context.id || undefined,
  });
  if (limit) return limit;
  if (Number(request.headers.get("content-length")) > 3_200_000)
    return noStoreJson(
      { error: "A kép legfeljebb 3 MB lehet." },
      { status: 413 },
    );
  try {
    const data = await request.formData();
    const file = data.get("photo");
    if (!(file instanceof File) || file.size === 0 || file.size > 3_000_000)
      return noStoreJson(
        { error: "Válasszon legfeljebb 3 MB-os JPG, PNG vagy WebP képet." },
        { status: 400 },
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = teamImageType(bytes);
    if (!contentType || file.type !== contentType)
      return noStoreJson(
        { error: "Csak valódi JPG, PNG vagy WebP fénykép tölthető fel." },
        { status: 400 },
      );
    const asset = await teamClient(true).assets.upload(
      "image",
      Buffer.from(bytes),
      {
        contentType,
        filename: `team-photo.${contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1]}`,
      },
    );
    return noStoreJson({
      photo: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      photoUrl: asset.url,
    });
  } catch {
    return noStoreJson(
      { error: "A képfeltöltés nem sikerült. Próbálja újra." },
      { status: 503 },
    );
  }
}
