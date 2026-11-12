"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Crown,
  LayoutGrid,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import type { StaffIdentity } from "@/lib/staffAuth";
import styles from "./admin-ui.module.css";

export type AdminTab =
  | "stats"
  | "appointments"
  | "career"
  | "quotes"
  | "blog"
  | "marketing"
  | "team"
  | "staff"
  | "security";
const sections = [
  {
    id: "appointments",
    label: "Páciensek",
    description: "Megkeresések és időpontok egy helyen.",
    icon: CalendarDays,
    group: "Rendelő",
  },
  {
    id: "stats",
    label: "Elemzések",
    description: "Látogatottság, források és időpontkérések.",
    icon: BarChart3,
    group: "Rendelő",
  },
  {
    id: "quotes",
    label: "Árajánlatkérések",
    description: "Kalkulációk és személyes egyeztetések.",
    icon: Sparkles,
    group: "Rendelő",
  },
  {
    id: "career",
    label: "Jelentkezők",
    description: "Munkatársi jelentkezések és elérhetőségek.",
    icon: Briefcase,
    group: "Rendelő",
  },
  {
    id: "marketing",
    label: "Kapcsolatok",
    description: "Marketinghez hozzájárult feliratkozók.",
    icon: Mail,
    group: "Kommunikáció",
  },
  {
    id: "blog",
    label: "Blog",
    description: "Cikkek és tartalmak kezelése.",
    icon: BookOpen,
    group: "Kommunikáció",
  },
  {
    id: "team",
    label: "Kollégáink oldal",
    description: "A weboldal csapata és a bemutatkozások.",
    icon: UsersRound,
    group: "Kommunikáció",
  },
  {
    id: "staff",
    label: "Kollégák",
    description: "A csapat és a hozzáférések kezelése.",
    icon: UsersRound,
    group: "Beállítások",
  },
  {
    id: "security",
    label: "Fiókbiztonság",
    description: "Saját jelszó és kétlépcsős azonosítás.",
    icon: LockKeyhole,
    group: "Beállítások",
  },
] satisfies {
  id: AdminTab;
  label: string;
  description: string;
  icon: typeof CalendarDays;
  group: string;
}[];

export default function AdminShell({
  identity,
  activeTab,
  onSelect,
  refreshing,
  onRefresh,
  onLogout,
  updatedAt,
  pendingCount,
  children,
}: {
  identity: StaffIdentity;
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  updatedAt: Date | null;
  pendingCount: number;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = sections.filter(
    (tab) =>
      identity.role === "admin" ||
      ["appointments", "security"].includes(tab.id),
  );
  const current = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const primary = tabs.filter((tab) =>
    identity.role === "admin"
      ? ["appointments", "stats", "marketing"].includes(tab.id)
      : ["appointments", "security"].includes(tab.id),
  );
  const inMore = !primary.some((tab) => tab.id === activeTab);
  const initials = identity.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  function select(tab: AdminTab) {
    dialog.current?.close();
    setMenuOpen(false);
    onSelect(tab);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <div className={styles.shell}>
      <a href="#admin-content" className={styles.skip}>
        Ugrás a tartalomhoz
      </a>
      <aside className={styles.sidebar} aria-label="Oldalsó menü">
        <Link href="/crown-dental" className={styles.brand}>
          <span className={styles.brandIcon}>
            <Crown aria-hidden="true" />
          </span>
          <span>
            Crown Dental<small>Rendelői munkatér</small>
          </span>
        </Link>
        <nav aria-label="Fő navigáció" className={styles.desktopNav}>
          {["Rendelő", "Kommunikáció", "Beállítások"].map(
            (group) =>
              tabs.some((tab) => tab.group === group) && (
                <div key={group} className={styles.navGroup}>
                  <p>{group}</p>
                  {tabs
                    .filter((tab) => tab.group === group)
                    .map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => select(id)}
                        aria-current={activeTab === id ? "page" : undefined}
                        className={styles.navItem}
                      >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                        {id === "appointments" && pendingCount > 0 && (
                          <span className={styles.badge}>{pendingCount}</span>
                        )}
                      </button>
                    ))}
                </div>
              ),
          )}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.profile}>
            <span className={styles.avatar}>{initials || "CD"}</span>
            <span className="min-w-0">
              <strong className="block truncate">{identity.name}</strong>
              <small>
                {identity.role === "admin" ? "Adminisztrátor" : "Asszisztens"}
              </small>
            </span>
            <ShieldCheck
              className="ml-auto h-4 w-4 shrink-0 text-sky-300"
              aria-label="Kétlépcsős belépés"
            />
          </div>
          <div className={styles.footerActions}>
            {identity.role === "admin" && (
              <Link href="/admin/portal">
                <LayoutGrid aria-hidden="true" /> Márkaválasztó
              </Link>
            )}
            <button onClick={onLogout}>
              <LogOut aria-hidden="true" /> Kijelentkezés
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.header}>
          <div className="flex min-w-0 items-center gap-3">
            <span className={styles.mobileBrand}>
              <Crown aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className={styles.headerEyebrow}>
                Crown Dental <span> / Munkatér</span>
              </p>
              <h1>{current.label}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className={styles.sync}>
              {updatedAt
                ? `Frissítve ${updatedAt.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}`
                : "Kapcsolódás…"}
            </span>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Adatok frissítése"
              className={styles.refresh}
            >
              <RefreshCw
                className={refreshing ? "animate-spin" : ""}
                aria-hidden="true"
              />
              <span>Frissítés</span>
            </button>
            <button
              className={styles.menuTrigger}
              aria-label="Menü megnyitása"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => {
                dialog.current?.showModal();
                setMenuOpen(true);
              }}
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </header>
        <main id="admin-content" tabIndex={-1} className={styles.content}>
          <div className={styles.pageIntro}>
            <p>{current.description}</p>
            <span className={styles.live}>
              <span /> Biztonságos munkamenet
            </span>
          </div>
          {children}
        </main>
      </div>

      <nav aria-label="Mobil navigáció" className={styles.bottomNav}>
        {primary.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => select(id)}
            aria-current={activeTab === id ? "page" : undefined}
          >
            <span className={styles.bottomIcon}>
              <Icon aria-hidden="true" />
              {id === "appointments" && pendingCount > 0 && (
                <i aria-label={`${pendingCount} új megkeresés`} />
              )}
            </span>
            <span>{label}</span>
          </button>
        ))}
        <button
          aria-current={inMore ? "page" : undefined}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => {
            dialog.current?.showModal();
            setMenuOpen(true);
          }}
        >
          <span className={styles.bottomIcon}>
            <Menu aria-hidden="true" />
          </span>
          <span>Menü</span>
        </button>
      </nav>

      <dialog
        ref={dialog}
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
        aria-labelledby="admin-menu-title"
        className={styles.menuDialog}
      >
        <div className={styles.menuPanel}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-sky-700">Crown Dental</p>
              <h2
                id="admin-menu-title"
                className="mt-1 text-xl font-bold text-slate-950"
              >
                Munkatér menü
              </h2>
            </div>
            <button
              autoFocus
              onClick={() => dialog.current?.close()}
              aria-label="Menü bezárása"
              className={styles.close}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Összes menüpont" className={styles.menuLinks}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => select(id)}
                aria-current={activeTab === id ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
                <ChevronRight className="ml-auto" aria-hidden="true" />
              </button>
            ))}
          </nav>
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
            <span className={`${styles.avatar} bg-sky-50 text-sky-800`}>
              {initials || "CD"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {identity.name}
              </p>
              <p className="text-xs text-slate-500">
                {identity.role === "admin" ? "Adminisztrátor" : "Asszisztens"}
              </p>
            </div>
          </div>
          <div className={styles.menuFooter}>
            {identity.role === "admin" && (
              <Link href="/admin/portal">
                <LayoutGrid aria-hidden="true" /> Márkaválasztó
              </Link>
            )}
            <button onClick={onLogout}>
              <LogOut aria-hidden="true" /> Kijelentkezés
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
