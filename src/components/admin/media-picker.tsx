"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  mimeType: string;
  createdAt: string;
}

export function MediaPickerButton({ onSelect }: { onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
      >
        Choisir
      </button>
      {open ? (
        <MediaPickerModal
          onClose={() => setOpen(false)}
          onSelect={(url) => {
            onSelect(url);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

export function MediaPickerModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setItems(data.media ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur d'upload");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Médiathèque</h3>
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium cursor-pointer hover:bg-gray-50">
              {uploading ? "Upload..." : "+ Importer une image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5">
          {error ? (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          ) : null}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c2185b] border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Aucune image. Importez votre première image.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelect(m.url)}
                  className="group aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#c2185b] hover:shadow-lg transition relative bg-gray-50"
                >
                  <img src={m.url} alt={m.altText ?? m.filename} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end p-2">
                    <span className="text-white text-xs truncate opacity-0 group-hover:opacity-100 transition">
                      {m.filename}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
