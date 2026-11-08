import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Phone, Plus, UsersRound } from "lucide-react";
import {
  buildBreadcrumbJsonLd,
  buildLocalizedMetadata,
  localePrefix,
  normalizeLocale,
  safeJsonLd,
} from "@/lib/seo";
import { getPublicTeam } from "@/lib/teamServer";
import {
  localizedTeamText,
  TEAM_ROLES,
  type TeamMember,
  type TeamLocale,
} from "@/lib/team";
import { teamContent } from "@/lib/teamContent";
import styles from "./team.module.css";

export const revalidate = 300;
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale((await params).locale);
  return buildLocalizedMetadata({
    locale,
    path: "kollegaink",
    title: teamContent[locale].title,
    description: teamContent[locale].description,
  });
}
function Portrait({
  member,
  priority = false,
}: {
  member: TeamMember;
  priority?: boolean;
}) {
  return (
    <div className={styles.portrait}>
      {member.photoUrl ? (
        <Image
          src={member.photoUrl}
          alt={member.name}
          fill
          unoptimized
          priority={priority}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
        />
      ) : (
        <UsersRound aria-hidden="true" size={64} />
      )}
    </div>
  );
}
function Biography({ text }: { text: string }) {
  return (
    <div className={styles.bio}>
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
    </div>
  );
}
export default async function TeamPage({ params }: Props) {
  const locale: TeamLocale = normalizeLocale((await params).locale);
  const copy = teamContent[locale];
  const prefix = localePrefix(locale);
  const members = await getPublicTeam();
  const lead = members.find((member) => member.role === "professional_lead");
  const groups = TEAM_ROLES.filter((role) =>
    members.some((member) => member.role === role),
  );
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            buildBreadcrumbJsonLd(locale, "kollegaink", copy.pageName),
          ),
        }}
      />
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            <span />
            {copy.eyebrow}
          </span>
          <h1>
            {copy.heading}
            <br />
            <em>{copy.headingAccent}</em>
          </h1>
          <p>{copy.intro}</p>
          <div className={styles.heroFoot}>
            <span className={styles.wordmark}>
              CROWN <span>DENTAL</span>
            </span>
            <span className={styles.line} />
            <a
              href={members.length ? "#csapat" : "#kapcsolodjunk"}
              aria-label={members.length ? copy.pageName : copy.book}
            >
              <ArrowDown size={21} />
            </a>
          </div>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <span>+</span>
          <span>+</span>
          <span>+</span>
          <span>+</span>
        </div>
      </header>
      {members.length > 0 ? (
        <>
          <nav className={styles.groupNav} aria-label={copy.pageName}>
            <div>
              {groups.map((role) => (
                <a key={role} href={`#${role}`}>
                  {copy.groups[role]}
                </a>
              ))}
            </div>
          </nav>
          <div className={styles.team} id="csapat">
            {TEAM_ROLES.filter((role) => role !== "professional_lead").map(
              (role, index) => {
                const group = members.filter((member) => member.role === role);
                if (!group.length) return null;
                return (
                  <section
                    key={role}
                    id={role}
                    className={styles.teamSection}
                    aria-labelledby={`${role}-heading`}
                  >
                    <div className={styles.sectionTop}>
                      <span className={styles.eyebrow}>
                        0{index + 1} / {copy.sections[role]}
                      </span>
                      <h2 id={`${role}-heading`}>{copy.groups[role]}</h2>
                      <span className={styles.sectionLine} />
                    </div>
                    <div className={styles.grid}>
                      {group.map((member) => {
                        const bio = localizedTeamText(member.bio, locale);
                        return (
                          <article className={styles.card} key={member._id}>
                            <div className={styles.cardImage}>
                              <Portrait member={member} />
                              <span className={styles.rolePill}>
                                {copy.roles[role]}
                              </span>
                            </div>
                            <div className={styles.cardCopy}>
                              <h3>{member.name}</h3>
                              {localizedTeamText(member.title, locale) && (
                                <p className={styles.subtitle}>
                                  {localizedTeamText(member.title, locale)}
                                </p>
                              )}
                              {bio && (
                                <details className={styles.details}>
                                  <summary>
                                    {copy.bio}
                                    <Plus size={17} />
                                  </summary>
                                  <Biography text={bio} />
                                </details>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              },
            )}
            {lead && (
              <section
                id="professional_lead"
                className={styles.leadSection}
                aria-labelledby="lead-heading"
              >
                <div className={styles.sectionTop}>
                  <span className={styles.eyebrow}>
                    04 / {copy.sections.professional_lead}
                  </span>
                  <h2 id="lead-heading">{copy.groups.professional_lead}</h2>
                </div>
                <article className={styles.lead}>
                  <Portrait member={lead} />
                  <div className={styles.leadCopy}>
                    <span className={styles.role}>
                      {copy.roles.professional_lead}
                    </span>
                    <h3>{lead.name}</h3>
                    {localizedTeamText(lead.title, locale) && (
                      <p className={styles.subtitle}>
                        {localizedTeamText(lead.title, locale)}
                      </p>
                    )}
                    <Biography text={localizedTeamText(lead.bio, locale)} />
                    <Link
                      href={`${prefix}/idopont`}
                      className={styles.textLink}
                    >
                      {copy.book}
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              </section>
            )}
          </div>
        </>
      ) : (
        <section className={styles.empty} aria-labelledby="soon-heading">
          <div className={styles.emptyIcon}>
            <UsersRound size={30} strokeWidth={1.3} />
          </div>
          <span className={styles.eyebrow}>Crown Dental</span>
          <h2 id="soon-heading">{copy.emptyTitle}</h2>
          <p>{copy.emptyText}</p>
          <div className={styles.emptyRoles}>
            {TEAM_ROLES.map((role) => (
              <span key={role}>{copy.groups[role]}</span>
            ))}
          </div>
        </section>
      )}
      <section id="kapcsolodjunk" className={styles.contact}>
        <div>
          <span className={styles.eyebrow}>{copy.contactEyebrow}</span>
          <h2>{copy.contactTitle}</h2>
          <p>{copy.contactText}</p>
        </div>
        <div className={styles.contactActions}>
          <Link href={`${prefix}/idopont`} className={styles.primary}>
            {copy.book}
            <ArrowRight size={18} />
          </Link>
          <a href="tel:+36305892468" className={styles.phone}>
            <Phone size={17} />
            {copy.call}
          </a>
        </div>
      </section>
    </main>
  );
}
