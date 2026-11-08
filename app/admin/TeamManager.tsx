"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  RefreshCw,
  Save,
  UsersRound,
} from "lucide-react";
import {
  TEAM_LEAD_ID,
  TEAM_LOCALES,
  TEAM_ROLES,
  TEAM_ROLE_LABELS,
  type TeamLocale,
  type TeamMember,
  type TeamRole,
} from "@/lib/team";
import styles from "./team-manager.module.css";

type Editor = Omit<TeamMember, "_id" | "_rev" | "_type"> &
  Partial<Pick<TeamMember, "_id" | "_rev">>;
const languageNames = { hu: "Magyar", en: "Angol", sk: "Szlovák", de: "Német" };
const blank = (role: TeamRole): Editor => ({
  name: "",
  role,
  title: {},
  bio: {},
  displayOrder: 0,
  isVisible: false,
});

async function jsonRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, { ...options, cache: "no-store" });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "A művelet nem sikerült. Próbálja újra.");
  return data;
}
function thumbnail(source: string) {
  const url = new URL(source);
  url.searchParams.set("w", "160");
  url.searchParams.set("h", "200");
  return url.toString();
}
async function preparePhoto(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("JPG, PNG vagy WebP fényképet válasszon.");
  if (file.size > 25_000_000)
    throw new Error("Válasszon 25 MB-nál kisebb fényképet.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("A fénykép nem dolgozható fel.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value
            ? resolve(value)
            : reject(new Error("A fénykép nem dolgozható fel.")),
        "image/webp",
        0.87,
      ),
    );
    if (blob.size > 3_000_000)
      throw new Error("A fénykép túl nagy. Válasszon kisebb képet.");
    return new File([blob], "team-photo.webp", { type: blob.type });
  } finally {
    bitmap.close();
  }
}

export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [language, setLanguage] = useState<TeamLocale>("hu");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function load(signal?: AbortSignal) {
    setLoading(true);
    setError("");
    try {
      const data = await jsonRequest("/api/admin/team", { signal });
      setMembers(data.members);
    } catch (err) {
      if (!signal?.aborted)
        setError(
          err instanceof Error ? err.message : "A lista nem tölthető be.",
        );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }
  useEffect(() => {
    const abort = new AbortController();
    jsonRequest("/api/admin/team", { signal: abort.signal })
      .then((data) => {
        if (!abort.signal.aborted) setMembers(data.members);
      })
      .catch((err) => {
        if (!abort.signal.aborted)
          setError(
            err instanceof Error ? err.message : "A lista nem tölthető be.",
          );
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function open(member: Editor) {
    setEditor(member);
    setLanguage("hu");
    setDirty(false);
    setError("");
    setNotice("");
  }
  function close() {
    if (
      busy ||
      uploading ||
      (dirty && !window.confirm("Elveti a még nem mentett módosításokat?"))
    )
      return;
    setEditor(null);
    setDirty(false);
    setError("");
  }
  function change(values: Partial<Editor>) {
    setEditor((current) => (current ? { ...current, ...values } : current));
    setDirty(true);
  }
  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("photo", await preparePhoto(file));
      const data = await jsonRequest("/api/admin/team/photo", {
        method: "POST",
        body: form,
      });
      change({ photo: data.photo, photoUrl: data.photoUrl });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "A képfeltöltés nem sikerült.",
      );
    } finally {
      setUploading(false);
    }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || uploading) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await jsonRequest("/api/admin/team", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(editor),
      });
      setMembers((current) => [
        ...current.filter((member) => member._id !== data.member._id),
        data.member,
      ]);
      setEditor(null);
      setDirty(false);
      setNotice(
        data.member.isVisible
          ? "Elmentve. A kolléga megjelenik a Kollégáink oldalon."
          : "Elmentve. Az adatlap rejtett, a weboldalon nem jelenik meg.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "A mentés nem sikerült.");
    } finally {
      setBusy(false);
    }
  }
  const hasLead = members.some((member) => member._id === TEAM_LEAD_ID);

  return (
    <section
      className={styles.manager}
      aria-label="Kollégáink oldal szerkesztése"
    >
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>A weboldal csapata</span>
          <h2>Kollégáink</h2>
          <p>
            A pácienseknek szóló bemutatkozások, képek és megjelenési sorrend.
          </p>
        </div>
        <a
          href="https://www.crowndental.hu/kollegaink"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondary}
        >
          Oldal megnyitása <ArrowUpRight size={17} />
        </a>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className={styles.notice} role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
      {editor ? (
        <form onSubmit={save} className={styles.editor}>
          <div className={styles.editorHeading}>
            <button
              type="button"
              onClick={close}
              disabled={busy || uploading}
              className={styles.secondary}
            >
              <ArrowLeft size={18} /> Vissza a listához
            </button>
            <span>{editor._id ? "Adatlap szerkesztése" : "Új kolléga"}</span>
          </div>
          <div className={styles.fields}>
            <div className={styles.photoPanel}>
              <div className={styles.portrait}>
                {editor.photoUrl ? (
                  <Image
                    unoptimized
                    width={640}
                    height={800}
                    src={editor.photoUrl}
                    alt={editor.name || "A kolléga portréja"}
                  />
                ) : (
                  <UsersRound size={54} aria-hidden="true" />
                )}
              </div>
              <label className={styles.upload}>
                <ImagePlus size={18} />
                {uploading
                  ? "Feltöltés…"
                  : editor.photo
                    ? "Másik fénykép"
                    : "Fénykép feltöltése"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy || uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                    event.target.value = "";
                  }}
                />
              </label>
              <p>
                Álló portré ajánlott. A képet automatikusan méretezzük. A
                weboldalon 4:5 arányban jelenik meg; a fókuszt a Studio
                képszerkesztőjében is beállíthatod.
              </p>
            </div>
            <div className={styles.formFields}>
              <label>
                Teljes név <span>*</span>
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={editor.name}
                  disabled={busy}
                  onChange={(event) => change({ name: event.target.value })}
                  autoComplete="off"
                />
              </label>
              <div className={styles.row}>
                <label>
                  Munkakör
                  <select
                    value={editor.role}
                    disabled={busy || editor.role === "professional_lead"}
                    onChange={(event) =>
                      change({ role: event.target.value as TeamRole })
                    }
                  >
                    {TEAM_ROLES.filter(
                      (role) =>
                        role !== "professional_lead" ||
                        editor.role === "professional_lead",
                    ).map((role) => (
                      <option key={role} value={role}>
                        {TEAM_ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Sorrend a csoporton belül
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    required
                    value={editor.displayOrder}
                    disabled={busy}
                    onChange={(event) =>
                      change({ displayOrder: Number(event.target.value) })
                    }
                  />
                  <small>A kisebb szám jelenik meg előbb.</small>
                </label>
              </div>
              <div
                className={styles.languages}
                role="group"
                aria-label="Szerkesztés nyelve"
              >
                {TEAM_LOCALES.map((locale) => (
                  <button
                    type="button"
                    key={locale}
                    aria-pressed={language === locale}
                    onClick={() => setLanguage(locale)}
                  >
                    {languageNames[locale]}
                  </button>
                ))}
              </div>
              <p className={styles.hint}>
                A név és a munkakör minden nyelven közös. A megnevezés és a
                bemutatkozás fordítható; hiányzó fordításnál a magyar szöveg
                jelenik meg.
              </p>
              <label>
                Szakterület / megnevezés · {languageNames[language]}
                <input
                  maxLength={160}
                  value={editor.title[language] || ""}
                  disabled={busy}
                  onChange={(event) =>
                    change({
                      title: {
                        ...editor.title,
                        [language]: event.target.value,
                      },
                    })
                  }
                  placeholder="Például: fogorvos, esztétikai fogászat"
                />
              </label>
              <label>
                Bemutatkozás · {languageNames[language]}
                <textarea
                  rows={7}
                  maxLength={5000}
                  value={editor.bio[language] || ""}
                  disabled={busy}
                  onChange={(event) =>
                    change({
                      bio: { ...editor.bio, [language]: event.target.value },
                    })
                  }
                />
                <small>
                  Legfeljebb 5000 karakter. Üres sorral új bekezdést adhatsz
                  meg.
                </small>
              </label>
              <label className={styles.visibility}>
                <input
                  type="checkbox"
                  checked={editor.isVisible}
                  disabled={busy}
                  onChange={(event) =>
                    change({ isVisible: event.target.checked })
                  }
                />
                <span>
                  <strong>Megjelenik a weboldalon</strong>
                  <small>
                    Bekapcsolás után a mentéssel válik nyilvánossá. Kikapcsolva
                    megőrizheted az adatlapot rejtve.
                  </small>
                </span>
              </label>
            </div>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={close}
              disabled={busy || uploading}
            >
              Mégse
            </button>
            <button
              className={styles.primary}
              type="submit"
              disabled={busy || uploading}
            >
              <Save size={18} />
              {busy ? "Mentés…" : "Adatlap mentése"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.toolbar}>
            <span>
              {members.length} adatlap ·{" "}
              {members.filter((member) => member.isVisible).length} nyilvános
            </span>
            <button
              className={styles.secondary}
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? styles.spin : ""} />
              Frissítés
            </button>
          </div>
          {loading ? (
            <div className={styles.empty} role="status">
              A csapat betöltése…
            </div>
          ) : error && !members.length ? (
            <div className={styles.empty}>
              A lista betöltése nem sikerült. A Frissítés gombbal próbálhatod
              újra.
            </div>
          ) : (
            TEAM_ROLES.map((role) => {
              const group = members
                .filter((member) => member.role === role)
                .sort(
                  (a, b) =>
                    a.displayOrder - b.displayOrder ||
                    a.name.localeCompare(b.name, "hu"),
                );
              return (
                <div className={styles.group} key={role}>
                  <div className={styles.groupHeading}>
                    <h3>
                      {
                        {
                          professional_lead: "Vezetőség",
                          dentist: "Fogorvosaink",
                          dental_assistant: "Fogászati asszisztensek",
                          dental_hygienist: "Dentálhigiénikusok",
                        }[role]
                      }{" "}
                      <span>{group.length}</span>
                    </h3>
                    {(role !== "professional_lead" || !hasLead) && (
                      <button
                        className={styles.secondary}
                        onClick={() => open(blank(role))}
                      >
                        <Plus size={17} />
                        {role === "professional_lead"
                          ? "Vezető hozzáadása"
                          : "Kolléga hozzáadása"}
                      </button>
                    )}
                  </div>
                  {group.length ? (
                    <div className={styles.members}>
                      {group.map((member) => (
                        <button
                          className={styles.member}
                          key={member._id}
                          onClick={() =>
                            open({
                              ...member,
                              title: member.title || {},
                              bio: member.bio || {},
                            })
                          }
                        >
                          <div className={styles.avatar}>
                            {member.photoUrl ? (
                              <Image
                                unoptimized
                                width={56}
                                height={70}
                                src={thumbnail(member.photoUrl)}
                                alt=""
                              />
                            ) : (
                              <UsersRound size={24} />
                            )}
                          </div>
                          <span className={styles.memberInfo}>
                            <strong>{member.name}</strong>
                            <small>
                              {member.title?.hu ||
                                TEAM_ROLE_LABELS[member.role]}
                            </small>
                            <span
                              className={
                                member.isVisible
                                  ? styles.published
                                  : styles.hidden
                              }
                            >
                              {member.isVisible ? (
                                <Eye size={13} />
                              ) : (
                                <EyeOff size={13} />
                              )}
                              {member.isVisible ? "Nyilvános" : "Rejtett"}
                              <span> · Sorrend: {member.displayOrder}</span>
                            </span>
                          </span>
                          <span className={styles.editLabel}>
                            Szerkesztés <ArrowUpRight size={15} />
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.groupEmpty}>
                      Még nincs adatlap ebben a csoportban.
                    </p>
                  )}
                </div>
              );
            })
          )}
          <p className={styles.hint}>
            A belépési jogosultságokat a Beállítások → Kollégák menüben
            kezelheted. Az itteni adatlapok a nyilvános weboldalon jelennek meg.
          </p>
        </>
      )}
    </section>
  );
}
