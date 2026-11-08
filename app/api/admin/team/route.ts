import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { authorizeStaff, requireStaffOrigin } from "@/lib/staffAuth";
import { enforceRateLimit, noStoreJson } from "@/lib/serverSecurity";
import {
  TEAM_LEAD_ID,
  TEAM_TYPE,
  validTeamId,
  validateTeamInput,
  type TeamMember,
} from "@/lib/team";
import {
  TEAM_CACHE_TAG,
  TEAM_PROJECTION,
  teamClient,
  withTeamPhoto,
} from "@/lib/teamServer";

export async function GET(request: Request) {
  const access = await authorizeStaff(request);
  if (access.error) return access.error;
  try {
    const members = await teamClient(true).fetch<TeamMember[]>(
      `*[_type == $type && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(displayOrder asc, name asc) ${TEAM_PROJECTION}`,
      { type: TEAM_TYPE },
    );
    return noStoreJson({ members: members.map(withTeamPhoto) });
  } catch {
    return noStoreJson(
      { error: "A csapat nem tölthető be. Próbálja újra." },
      { status: 503 },
    );
  }
}
export async function POST(request: Request) {
  const originError = requireStaffOrigin(request);
  if (originError) return originError;
  const access = await authorizeStaff(request);
  if (access.error) return access.error;
  const limit = await enforceRateLimit(request, "team-edit", {
    limit: 60,
    windowMs: 15 * 60_000,
    key: access.context.id || undefined,
  });
  if (limit) return limit;
  if (Number(request.headers.get("content-length")) > 70_000)
    return noStoreJson({ error: "Túl nagy adatlap." }, { status: 413 });
  let body;
  let fields;
  try {
    const raw = await request.text();
    if (raw.length > 70_000)
      return noStoreJson({ error: "Túl nagy adatlap." }, { status: 413 });
    body = JSON.parse(raw);
    fields = validateTeamInput(body);
    if (
      body._id !== undefined &&
      (!validTeamId(body._id) ||
        typeof body._rev !== "string" ||
        !/^[a-zA-Z0-9_-]{1,128}$/.test(body._rev))
    )
      throw new Error("Frissítse a listát az adatlap mentése előtt.");
  } catch (error) {
    return noStoreJson(
      {
        error:
          error instanceof SyntaxError
            ? "Érvénytelen adatlap."
            : error instanceof Error
              ? error.message
              : "Érvénytelen adatlap.",
      },
      { status: 400 },
    );
  }
  try {
    const client = teamClient(true);
    const id =
      body._id ||
      (fields.role === "professional_lead"
        ? TEAM_LEAD_ID
        : `crownTeam.${randomUUID()}`);
    if ((id === TEAM_LEAD_ID) !== (fields.role === "professional_lead"))
      return noStoreJson(
        {
          error:
            "A vezetőség saját adatlapját szerkessze. Egy vezetőségi adatlap adható meg.",
        },
        { status: 409 },
      );
    let member: TeamMember;
    if (body._id) {
      const existing = await client.getDocument<TeamMember>(id);
      if (!existing || existing._type !== TEAM_TYPE)
        return noStoreJson(
          { error: "Az adatlap nem található." },
          { status: 404 },
        );
      let patch = client.patch(id).ifRevisionId(body._rev).set(fields);
      if (!fields.photo) patch = patch.unset(["photo"]);
      member = (await patch.commit({ visibility: "sync" })) as TeamMember;
    } else {
      member = (await client.create(
        { _id: id, _type: TEAM_TYPE, ...fields },
        { visibility: "sync" },
      )) as TeamMember;
    }
    revalidateTag(TEAM_CACHE_TAG, { expire: 0 });
    for (const locale of ["hu", "en", "sk", "de"])
      revalidatePath(`/${locale}/kollegaink`);
    return noStoreJson({ member: withTeamPhoto(member) });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 409
    )
      return noStoreJson(
        {
          error:
            "Az adatlapot közben módosították, vagy már van vezetőségi adatlap. Frissítse a listát, majd nyissa meg újra.",
        },
        { status: 409 },
      );
    return noStoreJson(
      {
        error:
          "A mentés nem sikerült. Az adatlapot nem zártuk be; próbálja újra.",
      },
      { status: 503 },
    );
  }
}
