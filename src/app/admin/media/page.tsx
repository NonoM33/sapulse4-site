"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
  title: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setItems(data.media ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/media", { method: "POST", body: form });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Erreur upload");
        }
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Supprimer ce média ? Les pages qui l'utilisent afficheront une image cassée.")) return;
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((m) => m.id !== id));
      setSelected(null);
    }
  }

  async function saveAlt(id: string, altText: string, title: string) {
    await fetch(`/api/admin/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText, title }),
    });
    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, altText, title } : m))
    );
    if (selected?.id === id) {
      setSelected((s) => (s ? { ...s, altText, title } : s));
    }
  }

  return (
    <AdminShell
      title="Médiathèque"
      actions={
        <label className="px-5 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
        >
          {uploading ? "Upload..." : "+ Importer"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      }
    >
      <p className="text-sm text-gray-500 mb-6">
        Gérez toutes les images du site. Formats acceptés : JPG, PNG, WebP, GIF, SVG (max 10 Mo).
      </p>

      {error ? (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c2185b] border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-500">
          Aucune image pour l&apos;instant. Cliquez sur « + Importer ».
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m)}
              className="group aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#c2185b] hover:shadow-lg transition bg-gray-50 relative"
            >
              <img src={m.url} alt={m.altText ?? m.filename} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                <div className="text-white text-xs truncate">{m.filename}</div>
                <div className="text-white/70 text-[10px]">{formatBytes(m.sizeBytes)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <MediaDetail
          media={selected}
          onClose={() => setSelected(null)}
          onSave={saveAlt}
          onDelete={() => deleteItem(selected.id)}
        />
      ) : null}
    </AdminShell>
  );
}

function MediaDetail({
  media,
  onClose,
  onSave,
  onDelete,
}: {
  media: MediaItem;
  onClose: () => void;
  onSave: (id: string, altText: string, title: string) => Promise<void>;
  onDelete: () => void;
}) {
  const [altText, setAltText] = useState(media.altText ?? "");
  const [title, setTitle] = useState(media.title ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(media.id, altText, title);
    setSaving(false);
  }

  function copyUrl() {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Détails du média</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-auto p-5 space-y-4">
          <img src={media.url} alt={media.altText ?? media.filename} className="max-h-64 mx-auto rounded-lg" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-500">Nom</div>
              <div className="font-mono truncate">{media.filename}</div>
            </div>
            <div>
              <div className="text-gray-500">Taille</div>
              <div>{formatBytes(media.sizeBytes)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-gray-500">URL publique</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={media.url}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={copyUrl}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                >
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Titre (interne)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Texte alternatif (accessibilité)</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Ex : Photo de l'équipe en réunion"
            />
            <div className="text-xs text-gray-400 mt-1">
              Important pour le SEO et les lecteurs d&apos;écran.
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 flex justify-between">
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            Supprimer
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-white font-bold text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
          >
            {saving ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
