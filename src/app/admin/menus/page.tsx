"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

interface MenuItem {
  id?: string;
  label: string;
  url: string;
  target: "_self" | "_blank";
  sortOrder: number;
}

interface Menu {
  id: string;
  key: string;
  label: string;
  items: MenuItem[];
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newMenuKey, setNewMenuKey] = useState("");
  const [newMenuLabel, setNewMenuLabel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/menus");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setMenus(data.menus);
      setActiveMenuId((prev) => prev ?? (data.menus.length > 0 ? data.menus[0].id : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeMenu = menus.find((m) => m.id === activeMenuId) ?? null;

  function updateActiveItems(next: MenuItem[]) {
    setMenus((prev) =>
      prev.map((m) => (m.id === activeMenuId ? { ...m, items: next } : m))
    );
  }

  async function saveActive() {
    if (!activeMenu) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/menus/${activeMenu.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: activeMenu.label,
          items: activeMenu.items.map((it, i) => ({
            label: it.label,
            url: it.url,
            target: it.target,
            sortOrder: i,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur");
      }
      setToast("Menu enregistré");
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function createMenu() {
    if (!newMenuKey || !newMenuLabel) return;
    const res = await fetch("/api/admin/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: newMenuKey, label: newMenuLabel }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erreur");
      return;
    }
    setNewMenuKey("");
    setNewMenuLabel("");
    await load();
    setActiveMenuId(data.menu.id);
  }

  return (
    <AdminShell
      title="Menus"
      actions={
        activeMenu ? (
          <button
            onClick={saveActive}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
          >
            {saving ? "..." : "Enregistrer"}
          </button>
        ) : null
      }
    >
      <p className="text-sm text-gray-500 mb-6">
        Gérez les liens des menus de navigation (principal, footer, etc.).
      </p>

      {error ? (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c2185b] border-t-transparent" />
        </div>
      ) : (
        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <div className="space-y-2">
            {menus.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMenuId(m.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                  m.id === activeMenuId
                    ? "border-[#c2185b] bg-rose-50 text-[#c2185b] font-bold"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-bold">{m.label}</div>
                <div className="text-xs text-gray-400 font-mono">{m.key}</div>
              </button>
            ))}

            <div className="p-3 rounded-xl border border-dashed border-gray-300 space-y-2 mt-3">
              <div className="text-xs font-bold text-gray-500 uppercase">Nouveau menu</div>
              <input
                type="text"
                value={newMenuKey}
                onChange={(e) => setNewMenuKey(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="clé (ex: footer)"
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono"
              />
              <input
                type="text"
                value={newMenuLabel}
                onChange={(e) => setNewMenuLabel(e.target.value)}
                placeholder="Libellé"
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
              />
              <button
                onClick={createMenu}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                + Créer
              </button>
            </div>
          </div>

          <div>
            {activeMenu ? (
              <MenuItemList
                items={activeMenu.items}
                onChange={updateActiveItems}
              />
            ) : (
              <div className="p-10 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-500">
                Sélectionnez un menu ou créez-en un nouveau.
              </div>
            )}
          </div>
        </div>
      )}

      {toast ? (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200">
          {toast}
        </div>
      ) : null}
    </AdminShell>
  );
}

function MenuItemList({
  items,
  onChange,
}: {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
}) {
  function update(idx: number, partial: Partial<MenuItem>) {
    const next = [...items];
    next[idx] = { ...next[idx], ...partial };
    onChange(next);
  }
  function add() {
    onChange([...items, { label: "Nouveau lien", url: "/", target: "_self", sortOrder: items.length }]);
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function move(idx: number, delta: number) {
    const next = [...items];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="flex flex-col">
            <button onClick={() => move(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-sm">↑</button>
            <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-sm">↓</button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <input
              type="text"
              value={item.label}
              onChange={(e) => update(idx, { label: e.target.value })}
              placeholder="Libellé"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="text"
              value={item.url}
              onChange={(e) => update(idx, { url: e.target.value })}
              placeholder="/page ou https://..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
            />
            <select
              value={item.target}
              onChange={(e) => update(idx, { target: e.target.value as "_self" | "_blank" })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm col-span-2"
            >
              <option value="_self">Ouvrir dans la même fenêtre</option>
              <option value="_blank">Ouvrir dans un nouvel onglet</option>
            </select>
          </div>
          <button
            onClick={() => remove(idx)}
            className="text-sm text-gray-400 hover:text-red-500 px-2"
            title="Supprimer"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-[#c2185b]/30 hover:text-[#c2185b]"
      >
        + Ajouter un lien
      </button>
    </div>
  );
}
