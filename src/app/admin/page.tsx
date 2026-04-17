"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ContentItem {
  id: string;
  key: string;
  value: string;
  label: string;
  sortOrder: number;
}

type SectionsData = Record<string, ContentItem[]>;

interface UserInfo {
  name: string;
  email: string;
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

function isLongText(value: string): boolean {
  return value.length > 80 || value.includes("\n");
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sections, setSections] = useState<SectionsData>({});
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
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
    const sectionItems = sections[activeSection] ?? [];
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

      if (!res.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      // Update local state with saved values
      setSections((prev) => {
        const updated = { ...prev };
        const items = [...(updated[activeSection] ?? [])];
        for (const change of changes) {
          const idx = items.findIndex((item) => item.key === change.key);
          if (idx !== -1) {
            items[idx] = { ...items[idx], value: change.value };
          }
        }
        updated[activeSection] = items;
        return updated;
      });

      // Clear edited values for saved items
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

  const currentItems = sections[activeSection] ?? [];
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
        {/* Sidebar — sections */}
        <aside className="w-64 shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-20">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Sections</h2>
            </div>
            <ul className="p-2">
              {SECTION_ORDER.filter((s) => sections[s]).map((sectionKey) => {
                const isActive = activeSection === sectionKey;
                const itemCount = sections[sectionKey]?.length ?? 0;
                const editedCount = (sections[sectionKey] ?? []).filter(
                  (item) => editedValues[item.key] !== undefined && editedValues[item.key] !== item.value
                ).length;

                return (
                  <li key={sectionKey}>
                    <button
                      onClick={() => setActiveSection(sectionKey)}
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
          </nav>
        </aside>

        {/* Main content — edit form */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                {SECTION_LABELS[activeSection] ?? activeSection}
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
            <button
              onClick={handleSave}
              disabled={saving || sectionChanges.length === 0}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>

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
                  <div className="flex items-start justify-between mb-2">
                    <label htmlFor={item.key} className="text-sm font-bold text-gray-800">
                      {item.label}
                    </label>
                    <span className="text-xs text-gray-400 font-mono">{item.key}</span>
                  </div>
                  {isLongText(item.value) ? (
                    <textarea
                      id={item.key}
                      value={displayValue}
                      onChange={(e) => handleChange(item.key, e.target.value)}
                      rows={Math.min(Math.max(displayValue.split("\n").length, 3), 8)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b] transition-all resize-y"
                    />
                  ) : (
                    <input
                      id={item.key}
                      type="text"
                      value={displayValue}
                      onChange={(e) => handleChange(item.key, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b] transition-all"
                    />
                  )}
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

          {/* Sticky save bar when changes exist */}
          {hasChanges() && (
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
