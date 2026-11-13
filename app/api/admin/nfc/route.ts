import {
  authorizeStaff,
  requireStaffOrigin,
  staffServiceClient,
} from "@/lib/staffAuth";
import { noStoreJson } from "@/lib/serverSecurity";
import { validDay, rangeDays, localDay } from "@/lib/analyticsDates";

export async function POST(request: Request) {
  const originError = requireStaffOrigin(request);
  if (originError) return originError;
  const access = await authorizeStaff(request, "admin");
  if (access.error) return access.error;
  try {
    const body = await request.json();
    if (
      !validDay(body.from) ||
      !validDay(body.to) ||
      body.from < "2000-01-01" ||
      body.to < body.from ||
      body.to > localDay() ||
      rangeDays(body) > 3660
    )
      return noStoreJson(
        {
          error:
            "Érvényes, legfeljebb tízéves időszakot válasszon, jövőbeli nap nélkül.",
        },
        { status: 400 },
      );
    const { data, error } = await staffServiceClient().rpc("admin_nfc_report", {
      p_from: body.from,
      p_to: body.to,
    });
    if (error)
      return noStoreJson(
        { error: "A kártyakimutatás most nem tölthető be." },
        { status: 503 },
      );
    return noStoreJson({ range: { from: body.from, to: body.to }, ...data });
  } catch {
    return noStoreJson(
      { error: "A kártyakimutatás betöltése sikertelen." },
      { status: 503 },
    );
  }
}
