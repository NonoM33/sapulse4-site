"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { APP_VERSION, RELEASES, type Release } from "@/lib/version";

const RichEditor = dynamic(() => import("@/components/rich-editor"), { ssr: false });

interface ContentItem {
  id: string;
  key: string;
  value: string;
  label: string;
  sortOrder: number;
}

type SectionsData = Record<string, ContentItem[]>;

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserEntry {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const SECTION_LABELS: Record<string, string> = {
  meta: "SEO & Metadata",
  nav: "Navigation",
  hero: "Hero (accueil)",
  promesse: "Promesse",
  cloudSap: "Cloud SAP",
  pourQui: "Pour qui",
  methode: "Méthode",
  cta: "Appel à l'action",
  footer: "Footer",
};

const SECTION_ORDER = ["meta", "nav", "hero", "promesse", "cloudSap", "pourQui", "methode", "cta", "footer"];

type ActiveView = string; // section key or "__users" or "__password"

/** If Tiptap produced a bare <p>...</p> with no real formatting, store just the text. */
function unwrapSimpleParagraph(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^<p>([\s\S]*?)<\/p>$/);
  if (match && !/<[a-z/]/i.test(match[1])) {
    return match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }
  return value;
}

const TYPE_CONFIG: Record<Release["type"], { label: string; color: string; bg: string }> = {
  major: { label: "Majeure", color: "text-[#c2185b]", bg: "bg-rose-50 border-rose-200" },
  feature: { label: "Fonctionnalité", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  fix: { label: "Correction", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  security: { label: "Sécurité", color: "text-green-600", bg: "bg-green-50 border-green-200" },
};

function ReleasesView() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Historique des versions</h1>
        <p className="text-sm text-gray-500">
          Version actuelle : <span className="font-mono font-bold text-gray-700">{APP_VERSION}</span>
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#c2185b] via-[#ea580c] to-gray-200" />

        <div className="space-y-8">
          {RELEASES.map((release, idx) => {
            const config = TYPE_CONFIG[release.type];
            const isLatest = idx === 0;
            return (
              <div key={release.version} className="relative pl-16">
                {/* Timeline dot */}
                <div className={`absolute left-4 top-2 w-5 h-5 rounded-full border-[3px] ${
                  isLatest
                    ? "border-[#c2185b] bg-white shadow-lg shadow-rose-200"
                    : "border-gray-300 bg-white"
                }`} />

                <div className={`bg-white rounded-2xl border p-6 transition-all ${
                  isLatest ? "border-[#c2185b]/20 shadow-lg shadow-rose-50" : "border-gray-200"
                }`}>
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-mono text-lg font-extrabold text-gray-900">
                      v{release.version}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    {isLatest && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}>
                        Actuelle
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(release.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-3">{release.title}</h3>

                  {/* Highlights */}
                  <div className="space-y-2 mb-4">
                    {release.highlights.map((h) => (
                      <div key={h} className="flex items-start gap-2">
                        <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }} />
                        <span className="text-sm text-gray-700 font-medium">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Details (collapsible) */}
                  {release.details && release.details.length > 0 && (
                    <details className="group">
                      <summary className="text-xs font-bold text-gray-400 uppercase tracking-wide cursor-pointer hover:text-[#c2185b] transition-colors select-none">
                        Détails techniques ({release.details.length})
                      </summary>
                      <div className="mt-3 pl-3 border-l-2 border-gray-100 space-y-1.5">
                        {release.details.map((d) => (
                          <p key={d} className="text-xs text-gray-500">{d}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credits */}
      <div className="mt-12 text-center">
        <div className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <p className="text-sm text-gray-500">
            Développé avec <span className="text-red-500">❤️</span> par
          </p>
          <p className="text-lg font-extrabold text-gray-900">Renaud Cosson</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }} />
            <span className="text-xs text-gray-400 font-mono">BK Pulse Back Office v{APP_VERSION}</span>
            <div className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }} />
          </div>
        </div>
      </div>
    </>
  );
}

function PreviewIframe({ editedValues, sections }: { editedValues: Record<string, string>; sections: SectionsData }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function createPreview() {
      setLoading(true);
      // Build overrides: merge all edited values with current DB values
      const overrides: Record<string, string> = {};
      for (const [, items] of Object.entries(sections)) {
        for (const item of items) {
          if (editedValues[item.key] !== undefined) {
            overrides[item.key] = editedValues[item.key];
          }
        }
      }

      // If no overrides, just show live site
      if (Object.keys(overrides).length === 0) {
        setPreviewUrl("/?_t=" + Date.now());
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrides }),
        });
        if (res.ok) {
          const data = await res.json();
          setPreviewUrl(`/?preview=${data.token}&_t=${Date.now()}`);
        }
      } catch {
        setPreviewUrl("/?_t=" + Date.now());
      } finally {
        setLoading(false);
      }
    }
    createPreview();
  }, [editedValues, sections]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#c2185b] uppercase tracking-wide">Aperçu du site</span>
          {Object.keys(editedValues).length > 0 && (
            <span className="text-xs text-orange-500 font-medium">avec vos modifications</span>
          )}
        </div>
        <a
          href={previewUrl ?? "/"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-[#c2185b] transition-colors"
        >
          Ouvrir dans un nouvel onglet
        </a>
      </div>
      <div className="relative bg-white rounded-2xl border-2 border-[#c2185b]/20 overflow-hidden shadow-lg" style={{ height: "70vh" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c2185b] border-t-transparent" />
          </div>
        )}
        {previewUrl && (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            title="Aperçu du site"
          />
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sections, setSections] = useState<SectionsData>({});
  const [activeView, setActiveView] = useState<ActiveView>("hero");
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Users management
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", name: "", role: "editor" });
  const [creatingUser, setCreatingUser] = useState(false);

  // Password change
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const [meRes, contentRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/admin/content"),
        ]);

        if (!meRes.ok) {
          router.push("/admin/login");
          return;
        }

        const meData = await meRes.json();
        setUser(meData.user);

        if (contentRes.ok) {
          const contentData = await contentRes.json();
          setSections(contentData.sections);
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  function handleChange(key: string, value: string) {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  }

  function getDisplayValue(item: ContentItem): string {
    return editedValues[item.key] ?? item.value;
  }

  function hasChanges(): boolean {
    return Object.keys(editedValues).length > 0;
  }

  function getChangesForSection(): Array<{ key: string; value: string }> {
    if (activeView.startsWith("__")) return [];
    const sectionItems = sections[activeView] ?? [];
    return sectionItems
      .filter((item) => editedValues[item.key] !== undefined && editedValues[item.key] !== item.value)
      .map((item) => ({ key: item.key, value: editedValues[item.key] }));
  }

  async function handleSave() {
    const changes = getChangesForSection();
    if (changes.length === 0) {
      showToast("error", "Aucune modification à sauvegarder");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: changes }),
      });

      if (!res.ok) throw new Error("Erreur");

      setSections((prev) => {
        const updated = { ...prev };
        const items = [...(updated[activeView] ?? [])];
        for (const change of changes) {
          const idx = items.findIndex((item) => item.key === change.key);
          if (idx !== -1) {
            items[idx] = { ...items[idx], value: change.value };
          }
        }
        updated[activeView] = items;
        return updated;
      });

      setEditedValues((prev) => {
        const next = { ...prev };
        for (const change of changes) {
          delete next[change.key];
        }
        return next;
      });

      showToast("success", `${changes.length} modification${changes.length > 1 ? "s" : ""} sauvegardée${changes.length > 1 ? "s" : ""}`);
    } catch {
      showToast("error", "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error);
        return;
      }
      showToast("success", `Utilisateur ${data.user.name} créé`);
      setNewUser({ email: "", password: "", name: "", role: "editor" });
      setShowCreateUser(false);
      await loadUsers();
    } catch {
      showToast("error", "Erreur lors de la création");
    } finally {
      setCreatingUser(false);
    }
  }

  async function handleDeleteUser(id: string, name: string) {
    if (!confirm(`Supprimer l'utilisateur ${name} ?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error);
        return;
      }
      showToast("success", `${name} supprimé`);
      await loadUsers();
    } catch {
      showToast("error", "Erreur lors de la suppression");
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("error", "Les mots de passe ne correspondent pas");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error);
        return;
      }
      showToast("success", "Mot de passe modifié avec succès");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      showToast("error", "Erreur lors du changement de mot de passe");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c2185b] border-t-transparent" />
      </div>
    );
  }

  const isContentView = !activeView.startsWith("__");
  const currentItems = isContentView ? (sections[activeView] ?? []) : [];
  const sectionChanges = getChangesForSection();

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.svg" alt="BK Pulse" width={100} height={33} className="h-8 w-auto" />
            <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}>
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-20">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">CMS</h2>
            </div>
            <ul className="p-2">
              <li>
                <Link
                  href="/admin/pages"
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Pages
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/media"
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Médiathèque
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/menus"
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Menus
                </Link>
              </li>
              {user?.role === "admin" && (
                <li>
                  <Link
                    href="/admin/audit"
                    className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Historique
                  </Link>
                </li>
              )}
            </ul>

            <div className="p-4 border-t border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Page d&apos;accueil</h2>
            </div>
            <ul className="p-2">
              {SECTION_ORDER.filter((s) => sections[s]).map((sectionKey) => {
                const isActive = activeView === sectionKey;
                const itemCount = sections[sectionKey]?.length ?? 0;
                const editedCount = (sections[sectionKey] ?? []).filter(
                  (item) => editedValues[item.key] !== undefined && editedValues[item.key] !== item.value
                ).length;

                return (
                  <li key={sectionKey}>
                    <button
                      onClick={() => setActiveView(sectionKey)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "text-[#c2185b] bg-rose-50 font-bold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{SECTION_LABELS[sectionKey] ?? sectionKey}</span>
                        <div className="flex items-center gap-1.5">
                          {editedCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                          )}
                          <span className="text-xs text-gray-400">{itemCount}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Separator + account section */}
            <div className="p-4 border-t border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide mb-2">Compte</h2>
            </div>
            <ul className="p-2 pt-0">
              {user?.role === "admin" && (
                <li>
                  <button
                    onClick={() => { setActiveView("__users"); loadUsers(); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeView === "__users"
                        ? "text-[#c2185b] bg-rose-50 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    Utilisateurs
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => setActiveView("__password")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeView === "__password"
                      ? "text-[#c2185b] bg-rose-50 font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Mon mot de passe
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView("__releases")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeView === "__releases"
                      ? "text-[#c2185b] bg-rose-50 font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Versions
                </button>
              </li>
            </ul>

            {/* Version badge */}
            <div className="p-3 border-t border-gray-100 text-center">
              <span className="text-[10px] font-mono text-gray-400">v{APP_VERSION}</span>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">

          {/* ═══ CONTENT EDITING ═══ */}
          {isContentView && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">
                    {SECTION_LABELS[activeView] ?? activeView}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentItems.length} champ{currentItems.length > 1 ? "s" : ""} modifiable{currentItems.length > 1 ? "s" : ""}
                    {sectionChanges.length > 0 && (
                      <span className="text-orange-500 font-semibold ml-2">
                        ({sectionChanges.length} non sauvegardée{sectionChanges.length > 1 ? "s" : ""})
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      previewMode
                        ? "border-[#c2185b] text-[#c2185b] bg-rose-50"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {previewMode ? "Fermer l'aperçu" : "Aperçu"}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || sectionChanges.length === 0}
                    className="px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </div>

              {/* Preview — full site in iframe */}
              {previewMode && (
                <PreviewIframe editedValues={editedValues} sections={sections} />
              )}

              <div className="space-y-4">
                {currentItems.map((item) => {
                  const displayValue = getDisplayValue(item);
                  const isEdited = editedValues[item.key] !== undefined && editedValues[item.key] !== item.value;

                  return (
                    <div
                      key={item.key}
                      className={`bg-white rounded-xl border p-5 transition-all ${
                        isEdited ? "border-orange-300 shadow-md shadow-orange-100" : "border-gray-200"
                      }`}
                    >
                      <RichEditor
                        content={displayValue.startsWith("<") ? displayValue : `<p>${displayValue}</p>`}
                        onChange={(html) => handleChange(item.key, unwrapSimpleParagraph(html))}
                        label={item.label}
                        contentKey={item.key}
                      />
                      {isEdited && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-orange-500 font-medium">Modifié</span>
                          <button
                            onClick={() => {
                              setEditedValues((prev) => {
                                const next = { ...prev };
                                delete next[item.key];
                                return next;
                              });
                            }}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ═══ USERS MANAGEMENT ═══ */}
          {activeView === "__users" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">Utilisateurs</h1>
                  <p className="text-sm text-gray-500 mt-1">{users.length} utilisateur{users.length > 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20"
                  style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                >
                  + Nouvel utilisateur
                </button>
              </div>

              {/* Create user form */}
              {showCreateUser && (
                <form onSubmit={handleCreateUser} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
                  <h3 className="font-bold text-gray-900">Créer un utilisateur</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-name" className="block text-sm font-bold text-gray-700 mb-1">Nom</label>
                      <input
                        id="new-name"
                        type="text"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b]"
                        placeholder="Marie Dupont"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                      <input
                        id="new-email"
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b]"
                        placeholder="marie@bkpulse.fr"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
                      <input
                        id="new-password"
                        type="password"
                        required
                        minLength={8}
                        value={newUser.password}
                        onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b]"
                        placeholder="Min. 8 caractères"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-role" className="block text-sm font-bold text-gray-700 mb-1">Rôle</label>
                      <select
                        id="new-role"
                        value={newUser.role}
                        onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b]"
                      >
                        <option value="editor">Éditeur (modifier le contenu)</option>
                        <option value="admin">Admin (tout gérer)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={creatingUser}
                      className="px-5 py-2.5 rounded-lg text-white font-bold text-sm disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                    >
                      {creatingUser ? "Création..." : "Créer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateUser(false)}
                      className="px-5 py-2.5 rounded-lg text-gray-600 font-medium text-sm border border-gray-200 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Users list */}
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{u.name}</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            u.role === "admin"
                              ? "bg-rose-100 text-[#c2185b]"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {u.role === "admin" ? "Admin" : "Éditeur"}
                        </span>
                        {u.id === user?.id && (
                          <span className="text-xs text-gray-400">(vous)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{u.email}</p>
                    </div>
                    {u.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ PASSWORD CHANGE ═══ */}
          {activeView === "__password" && (
            <>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Changer mon mot de passe</h1>
              <p className="text-sm text-gray-500 mb-6">Connecté en tant que {user?.email}</p>

              <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-gray-200 p-6 max-w-md space-y-4">
                <div>
                  <label htmlFor="current-pw" className="block text-sm font-bold text-gray-700 mb-1">Mot de passe actuel</label>
                  <input
                    id="current-pw"
                    type="password"
                    required
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b]"
                  />
                </div>
                <div>
                  <label htmlFor="new-pw" className="block text-sm font-bold text-gray-700 mb-1">Nouveau mot de passe</label>
                  <input
                    id="new-pw"
                    type="password"
                    required
                    minLength={8}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b]"
                    placeholder="Min. 8 caractères"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-pw" className="block text-sm font-bold text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                  <input
                    id="confirm-pw"
                    type="password"
                    required
                    minLength={8}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-2.5 rounded-lg text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                >
                  {changingPassword ? "Modification..." : "Modifier le mot de passe"}
                </button>
              </form>
            </>
          )}

          {/* ═══ RELEASES ═══ */}
          {activeView === "__releases" && (
            <ReleasesView />
          )}

          {/* Sticky save bar */}
          {hasChanges() && isContentView && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
              <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
                <span className="text-sm">
                  {Object.keys(editedValues).length} modification{Object.keys(editedValues).length > 1 ? "s" : ""} en attente
                </span>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
                >
                  {saving ? "..." : "Sauvegarder"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer crédit */}
      <div className="text-center py-6 text-xs text-gray-400">
        <span>Développé avec </span>
        <span className="text-red-500">❤️</span>
        <span> par </span>
        <span className="font-semibold text-gray-500">Renaud Cosson</span>
        <span className="mx-2 text-gray-300">·</span>
        <span className="font-mono text-gray-300">v{APP_VERSION}</span>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold transition-all animate-slide-in ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
