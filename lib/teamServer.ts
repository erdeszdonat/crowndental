import "server-only";
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import {
  TEAM_LEAD_ID,
  TEAM_TYPE,
  validTeamId,
  validateTeamInput,
  type TeamMember,
} from "./team";

export const TEAM_CACHE_TAG = "crown-team";
export const TEAM_PROJECTION =
  "{_id,_rev,_type,name,role,title,bio,photo,displayOrder,isVisible}";
// A loopback-only development provider lets the complete editor be exercised
// without a production write token. Production always uses Sanity's API.
function developmentOrigin() {
  if (
    process.env.NODE_ENV !== "development" ||
    !process.env.CROWN_TEAM_DEV_API_ORIGIN
  )
    return undefined;
  const url = new URL(process.env.CROWN_TEAM_DEV_API_ORIGIN);
  if (
    url.protocol !== "http:" ||
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error("team_development_origin_invalid");
  return url.origin;
}
export function teamClient(write = false) {
  const token = write ? process.env.SANITY_WRITE_TOKEN : undefined;
  if (!projectId || (write && !token))
    throw new Error("team_configuration_missing");
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    timeout: 20_000,
    maxRetries: 1,
    perspective: "published",
    ...(developmentOrigin()
      ? { apiHost: developmentOrigin(), useProjectHostname: false }
      : {}),
    ...(token ? { token } : {}),
  });
}
export function withTeamPhoto(member: TeamMember): TeamMember {
  let photoUrl: string | undefined;
  if (member.photo?.asset?._ref) {
    try {
      photoUrl = imageUrlBuilder({ projectId, dataset })
        .image(member.photo)
        .width(1000)
        .height(1250)
        .fit("crop")
        .auto("format")
        .url();
    } catch {
      /* A broken asset must not break the page. */
    }
  }
  return { ...member, photoUrl };
}
export async function getPublicTeam(): Promise<TeamMember[]> {
  if (!projectId) return [];
  const query = `*[_type == $type && isVisible == true && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(displayOrder asc, name asc) ${TEAM_PROJECTION}`;
  const url = new URL(
    `${developmentOrigin() || `https://${projectId}.api.sanity.io`}/v${apiVersion}/data/query/${dataset}`,
  );
  url.searchParams.set("query", query);
  url.searchParams.set("$type", JSON.stringify(TEAM_TYPE));
  url.searchParams.set("perspective", "published");
  // Sanity restricts dotted IDs (including profiles created by our admin) to
  // authenticated reads. Keep the credential on the server and expose only
  // the explicitly visible documents selected by this fixed query.
  const readToken =
    process.env.SANITY_READ_TOKEN || process.env.SANITY_WRITE_TOKEN;
  const response = await fetch(url, {
    ...(readToken ? { headers: { Authorization: `Bearer ${readToken}` } } : {}),
    cache: "force-cache",
    next: { revalidate: 300, tags: [TEAM_CACHE_TAG] },
  });
  if (!response.ok) throw new Error("team_read_failed");
  const data = await response.json();
  if (!Array.isArray(data.result)) throw new Error("team_response_invalid");
  return (data.result as TeamMember[]).flatMap((member) => {
    try {
      if (
        member._type !== TEAM_TYPE ||
        !validTeamId(member._id) ||
        member.isVisible !== true ||
        (member.role === "professional_lead" && member._id !== TEAM_LEAD_ID)
      )
        return [];
      // Studio live edits may briefly contain an incomplete field. Keep such
      // profiles off the public page until they are valid again.
      const fields = validateTeamInput(member);
      return [withTeamPhoto({ ...member, ...fields })];
    } catch {
      return [];
    }
  });
}
