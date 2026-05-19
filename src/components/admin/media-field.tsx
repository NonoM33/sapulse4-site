"use client";

import { useRef, useState } from "react";
import { MediaPickerModal } from "./media-picker";

interface MediaFieldProps {
  label: string;
  value: string;
  defaultValue: string;
  onChange: (url: string) => void;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";

export function MediaField({ label, value, defaultValue, onChange }: MediaFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCustom = value !== defaultValue;

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur upload");
      onChange(data.media.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-bold text-gray-900">{label}</div>
          <div className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[18rem]">{value}</div>
        </div>
        {isCustom ? (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="text-xs text-gray-400 hover:text-[#c2185b] transition-colors"
            title="Restaurer l'image par défaut"
          >
            Réinitialiser
          </button>
        ) : null}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative rounded-xl border-2 border-dashed transition-colors flex items-center justify-center h-48 overflow-hidden bg-[length:20px_20px] ${
          dragOver
            ? "border-[#c2185b] bg-rose-50/50"
            : "border-gray-200 bg-white"
        }`}
        style={{
          backgroundImage:
            "linear-gradient(45deg, #f8f8f8 25%, transparent 25%), linear-gradient(-45deg, #f8f8f8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f8f8 75%), linear-gradient(-45deg, transparent 75%, #f8f8f8 75%)",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={label}
            className="max-w-full max-h-full object-contain p-4"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
            }}
          />
        ) : (
          <div className="text-sm text-gray-400">Aucune image</div>
        )}
        {uploading ? (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c2185b] border-t-transparent" />
          </div>
        ) : null}
        {dragOver ? (
          <div className="absolute inset-0 bg-rose-50/80 flex items-center justify-center pointer-events-none">
            <div className="text-sm font-bold text-[#c2185b]">Relâche pour téléverser</div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-3 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2.5 rounded-lg text-white font-bold text-sm transition-all disabled:opacity-50 hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
        >
          {uploading ? "Upload…" : "Téléverser une image"}
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={uploading}
          className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Choisir dans la médiathèque
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-3 text-center">
        Glisse-dépose une image dans la zone ci-dessus, téléverse depuis ton ordinateur, ou pioche dans la médiathèque.
        Formats : JPG, PNG, WebP, GIF, SVG (max 10 Mo).
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFile(file);
          e.target.value = "";
        }}
      />

      {pickerOpen ? (
        <MediaPickerModal
          onClose={() => setPickerOpen(false)}
          onSelect={(url) => {
            onChange(url);
            setPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
