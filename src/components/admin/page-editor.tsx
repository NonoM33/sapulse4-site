"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { MediaPickerButton } from "./media-picker";

const RichEditor = dynamic(() => import("@/components/rich-editor"), { ssr: false });

type BlockType = "hero" | "richtext" | "cards" | "image" | "cta" | "personas";

interface Block {
  id?: string;
  type: BlockType;
  data: Record<string, unknown>;
}

interface PageFormValues {
  slug: string;
  title: string;
  status: "draft" | "published";
  showInNav: boolean;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  blocks: Block[];
}

const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero (titre + CTA + image)",
  richtext: "Texte libre (éditeur)",
  cards: "Cartes (colonnes)",
  image: "Image seule",
  cta: "Appel à l'action",
  personas: "Personas (colonnes avec photo)",
};

function emptyBlock(type: BlockType): Block {
  switch (type) {
    case "hero":
      return { type, data: { title: "", subtitle: "", ctaLabel: "", ctaUrl: "", imageUrl: "", align: "center" } };
    case "richtext":
      return { type, data: { html: "<p></p>" } };
    case "cards":
      return { type, data: { title: "", columns: 3, items: [{ title: "", description: "", icon: "" }] } };
    case "image":
      return { type, data: { imageUrl: "", altText: "", caption: "", width: "contain" } };
    case "cta":
      return { type, data: { title: "", subtitle: "", buttonLabel: "", buttonUrl: "" } };
    case "personas":
      return { type, data: { title: "", items: [{ role: "", benefit: "", description: "", imageUrl: "", bullets: [] }] } };
  }
}

export function PageEditor({
  initial,
  pageId,
}: {
  initial?: Partial<PageFormValues>;
  pageId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PageFormValues>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    status: initial?.status ?? "draft",
    showInNav: initial?.showInNav ?? false,
    sortOrder: initial?.sortOrder ?? 0,
    metaTitle: initial?.metaTitle ?? "",
    metaDescription: initial?.metaDescription ?? "",
    ogImageUrl: initial?.ogImageUrl ?? "",
    blocks: initial?.blocks ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const updateBlock = useCallback((idx: number, data: Record<string, unknown>) => {
    setValues((prev) => {
      const next = [...prev.blocks];
      next[idx] = { ...next[idx], data };
      return { ...prev, blocks: next };
    });
  }, []);

  function addBlock(type: BlockType) {
    setValues((prev) => ({ ...prev, blocks: [...prev.blocks, emptyBlock(type)] }));
  }

  function removeBlock(idx: number) {
    setValues((prev) => ({ ...prev, blocks: prev.blocks.filter((_, i) => i !== idx) }));
  }

  function moveBlock(idx: number, delta: number) {
    setValues((prev) => {
      const next = [...prev.blocks];
      const target = idx + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, blocks: next };
    });
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const method = pageId ? "PUT" : "POST";
      const url = pageId ? `/api/admin/pages/${pageId}` : "/api/admin/pages";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setToast("Enregistré");
      if (!pageId) {
        router.push(`/admin/pages/${data.page.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      ) : null}

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Paramètres de la page</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Titre de la page">
            <input
              type="text"
              value={values.title}
              onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b]"
              placeholder="Mentions légales"
            />
          </Field>
          <Field label="Slug (URL)" hint={`https://site.fr/${values.slug || "mon-slug"}`}>
            <input
              type="text"
              value={values.slug}
              onChange={(e) => setValues((p) => ({ ...p, slug: e.target.value.toLowerCase() }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#c2185b]/20 focus:border-[#c2185b]"
              placeholder="mentions-legales"
            />
          </Field>
          <Field label="Statut">
            <select
              value={values.status}
              onChange={(e) => setValues((p) => ({ ...p, status: e.target.value as "draft" | "published" }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
            >
              <option value="draft">Brouillon (invisible)</option>
              <option value="published">Publiée (visible publiquement)</option>
            </select>
          </Field>
          <Field label="Afficher dans le menu principal ?">
            <label className="flex items-center gap-2 py-2.5">
              <input
                type="checkbox"
                checked={values.showInNav}
                onChange={(e) => setValues((p) => ({ ...p, showInNav: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Oui, ajouter au menu</span>
            </label>
          </Field>
          <Field label="Ordre dans le menu">
            <input
              type="number"
              value={values.sortOrder}
              onChange={(e) => setValues((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
            />
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">SEO</h2>
        <div className="grid gap-4">
          <Field label="Titre SEO (balise title)" hint="Si vide, le titre de la page est utilisé">
            <input
              type="text"
              value={values.metaTitle}
              onChange={(e) => setValues((p) => ({ ...p, metaTitle: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              maxLength={200}
            />
          </Field>
          <Field label="Description SEO" hint="Environ 150 caractères">
            <textarea
              value={values.metaDescription}
              onChange={(e) => setValues((p) => ({ ...p, metaDescription: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              rows={2}
              maxLength={500}
            />
          </Field>
          <Field label="Image de partage (Open Graph)">
            <div className="flex gap-2">
              <input
                type="text"
                value={values.ogImageUrl}
                onChange={(e) => setValues((p) => ({ ...p, ogImageUrl: e.target.value }))}
                placeholder="/uploads/..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              />
              <MediaPickerButton onSelect={(url) => setValues((p) => ({ ...p, ogImageUrl: url }))} />
            </div>
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Contenu (blocs)</h2>
          <span className="text-xs text-gray-500">{values.blocks.length} bloc{values.blocks.length > 1 ? "s" : ""}</span>
        </div>

        <div className="space-y-4">
          {values.blocks.map((block, idx) => (
            <BlockEditor
              key={idx}
              block={block}
              onChange={(data) => updateBlock(idx, data)}
              onMoveUp={() => moveBlock(idx, -1)}
              onMoveDown={() => moveBlock(idx, 1)}
              onRemove={() => removeBlock(idx)}
              isFirst={idx === 0}
              isLast={idx === values.blocks.length - 1}
            />
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="text-sm font-bold text-gray-700 mb-3">Ajouter un bloc</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:border-[#c2185b]/30"
              >
                + {BLOCK_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
          <span className="text-sm">
            {values.status === "published" ? "Publiée" : "Brouillon"}
          </span>
          <button
            onClick={save}
            disabled={saving || !values.title || !values.slug}
            className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
          >
            {saving ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {toast ? (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
      {children}
      {hint ? <div className="text-xs text-gray-400 mt-1">{hint}</div> : null}
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst,
  isLast,
}: {
  block: Block;
  onChange: (data: Record<string, unknown>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/40">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
            {BLOCK_LABELS[block.type]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="text-sm text-gray-400 hover:text-gray-700 disabled:opacity-30 px-2"
            title="Monter"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="text-sm text-gray-400 hover:text-gray-700 disabled:opacity-30 px-2"
            title="Descendre"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="text-sm text-gray-400 hover:text-red-500 px-2"
            title="Supprimer"
          >
            ×
          </button>
        </div>
      </div>
      <div className="p-4">
        {block.type === "hero" ? <HeroEditor data={block.data} onChange={onChange} /> : null}
        {block.type === "richtext" ? <RichTextEditor data={block.data} onChange={onChange} /> : null}
        {block.type === "cards" ? <CardsEditor data={block.data} onChange={onChange} /> : null}
        {block.type === "image" ? <ImageEditor data={block.data} onChange={onChange} /> : null}
        {block.type === "cta" ? <CtaEditor data={block.data} onChange={onChange} /> : null}
        {block.type === "personas" ? <PersonasEditor data={block.data} onChange={onChange} /> : null}
      </div>
    </div>
  );
}

function set<T extends Record<string, unknown>>(obj: T, key: string, value: unknown): T {
  return { ...obj, [key]: value };
}

function HeroEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Field label="Titre">
        <input
          type="text"
          value={String(data.title ?? "")}
          onChange={(e) => onChange(set(data, "title", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
      <Field label="Sous-titre">
        <input
          type="text"
          value={String(data.subtitle ?? "")}
          onChange={(e) => onChange(set(data, "subtitle", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
      <Field label="Label du bouton">
        <input
          type="text"
          value={String(data.ctaLabel ?? "")}
          onChange={(e) => onChange(set(data, "ctaLabel", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
      <Field label="Lien du bouton (URL)">
        <input
          type="text"
          value={String(data.ctaUrl ?? "")}
          onChange={(e) => onChange(set(data, "ctaUrl", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          placeholder="/contact ou https://..."
        />
      </Field>
      <Field label="Image de fond">
        <div className="flex gap-2">
          <input
            type="text"
            value={String(data.imageUrl ?? "")}
            onChange={(e) => onChange(set(data, "imageUrl", e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <MediaPickerButton onSelect={(url) => onChange(set(data, "imageUrl", url))} />
        </div>
      </Field>
      <Field label="Alignement">
        <select
          value={String(data.align ?? "center")}
          onChange={(e) => onChange(set(data, "align", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="center">Centré</option>
          <option value="left">Gauche</option>
        </select>
      </Field>
    </div>
  );
}

function RichTextEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const html = String(data.html ?? "<p></p>");
  return (
    <RichEditor
      content={html}
      onChange={(next) => onChange(set(data, "html", next))}
      label="Contenu"
      contentKey="block-richtext"
    />
  );
}

function CardsEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const items = (data.items as Array<{ title: string; description: string; icon: string }> | undefined) ?? [];
  function updateItem(idx: number, key: string, value: string) {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    onChange(set(data, "items", next));
  }
  function addItem() {
    onChange(set(data, "items", [...items, { title: "", description: "", icon: "" }]));
  }
  function removeItem(idx: number) {
    onChange(set(data, "items", items.filter((_, i) => i !== idx)));
  }
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Titre de la section">
          <input
            type="text"
            value={String(data.title ?? "")}
            onChange={(e) => onChange(set(data, "title", e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </Field>
        <Field label="Colonnes">
          <select
            value={Number(data.columns ?? 3)}
            onChange={(e) => onChange(set(data, "columns", Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value={2}>2 colonnes</option>
            <option value={3}>3 colonnes</option>
            <option value={4}>4 colonnes</option>
          </select>
        </Field>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="p-3 rounded-lg border border-gray-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Carte {idx + 1}</span>
              <button onClick={() => removeItem(idx)} className="text-xs text-gray-400 hover:text-red-500">
                Retirer
              </button>
            </div>
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(idx, "title", e.target.value)}
              placeholder="Titre"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <textarea
              value={item.description}
              onChange={(e) => updateItem(idx, "description", e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="text"
              value={item.icon}
              onChange={(e) => updateItem(idx, "icon", e.target.value)}
              placeholder="Emoji ou icône (ex: 🚀)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        ))}
        <button
          onClick={addItem}
          className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-[#c2185b]/30 hover:text-[#c2185b]"
        >
          + Ajouter une carte
        </button>
      </div>
    </div>
  );
}

function ImageEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Image">
        <div className="flex gap-2">
          <input
            type="text"
            value={String(data.imageUrl ?? "")}
            onChange={(e) => onChange(set(data, "imageUrl", e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <MediaPickerButton onSelect={(url) => onChange(set(data, "imageUrl", url))} />
        </div>
      </Field>
      <Field label="Texte alternatif (accessibilité)">
        <input
          type="text"
          value={String(data.altText ?? "")}
          onChange={(e) => onChange(set(data, "altText", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
      <Field label="Légende (optionnel)">
        <input
          type="text"
          value={String(data.caption ?? "")}
          onChange={(e) => onChange(set(data, "caption", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
      <Field label="Largeur">
        <select
          value={String(data.width ?? "contain")}
          onChange={(e) => onChange(set(data, "width", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="contain">Centrée (standard)</option>
          <option value="wide">Large</option>
          <option value="full">Pleine largeur</option>
        </select>
      </Field>
    </div>
  );
}

function CtaEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Field label="Titre">
        <input
          type="text"
          value={String(data.title ?? "")}
          onChange={(e) => onChange(set(data, "title", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
      <Field label="Sous-titre">
        <input
          type="text"
          value={String(data.subtitle ?? "")}
          onChange={(e) => onChange(set(data, "subtitle", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
      <Field label="Texte du bouton">
        <input
          type="text"
          value={String(data.buttonLabel ?? "")}
          onChange={(e) => onChange(set(data, "buttonLabel", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
      <Field label="Lien du bouton">
        <input
          type="text"
          value={String(data.buttonUrl ?? "")}
          onChange={(e) => onChange(set(data, "buttonUrl", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
    </div>
  );
}

function PersonasEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const items = (data.items as Array<{ role: string; benefit: string; description: string; imageUrl: string; bullets: string[] }> | undefined) ?? [];
  function updateItem(idx: number, partial: Partial<(typeof items)[number]>) {
    const next = [...items];
    next[idx] = { ...next[idx], ...partial };
    onChange(set(data, "items", next));
  }
  function addItem() {
    onChange(set(data, "items", [...items, { role: "", benefit: "", description: "", imageUrl: "", bullets: [] }]));
  }
  function removeItem(idx: number) {
    onChange(set(data, "items", items.filter((_, i) => i !== idx)));
  }
  return (
    <div className="space-y-4">
      <Field label="Titre de la section">
        <input
          type="text"
          value={String(data.title ?? "")}
          onChange={(e) => onChange(set(data, "title", e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </Field>
      {items.map((item, idx) => (
        <div key={idx} className="p-3 rounded-lg border border-gray-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Persona {idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-xs text-gray-400 hover:text-red-500">
              Retirer
            </button>
          </div>
          <input
            type="text"
            value={item.role}
            onChange={(e) => updateItem(idx, { role: e.target.value })}
            placeholder="Rôle (DAF, DG, DSI...)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="text"
            value={item.benefit}
            onChange={(e) => updateItem(idx, { benefit: e.target.value })}
            placeholder="Bénéfice"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <textarea
            value={item.description}
            onChange={(e) => updateItem(idx, { description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={item.imageUrl}
              onChange={(e) => updateItem(idx, { imageUrl: e.target.value })}
              placeholder="URL image"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <MediaPickerButton onSelect={(url) => updateItem(idx, { imageUrl: url })} />
          </div>
          <textarea
            value={(item.bullets ?? []).join("\n")}
            onChange={(e) =>
              updateItem(idx, { bullets: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })
            }
            placeholder="Un point par ligne"
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      ))}
      <button
        onClick={addItem}
        className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-[#c2185b]/30 hover:text-[#c2185b]"
      >
        + Ajouter un persona
      </button>
    </div>
  );
}
