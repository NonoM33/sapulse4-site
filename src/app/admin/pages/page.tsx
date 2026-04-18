"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

interface PageRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  showInNav: boolean;
  sortOrder: number;
  updatedAt: string;
  blocks: Array<{ id: string }>;
}

export default function AdminPagesList() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/pages");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur");
        setPages(data.pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function deletePage(id: string, title: string) {
    if (!confirm(`Supprimer définitivement la page « ${title} » ?`)) return;
    const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPages((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <AdminShell
      title="Pages"
      actions={
        <Link
          href="/admin/pages/new"
          className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #c2185b, #ea580c)" }}
        >
          + Nouvelle page
        </Link>
      }
    >
      <p className="text-sm text-gray-500 mb-6">
        Créez des pages supplémentaires (mentions légales, landings, articles, etc.).
        Elles seront accessibles via leur slug (ex : <span className="font-mono">/mentions-legales</span>).
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c2185b] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      ) : pages.length === 0 ? (
        <div className="p-10 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-500">
          Aucune page pour l&apos;instant.
          <Link href="/admin/pages/new" className="text-[#c2185b] font-bold ml-1 hover:underline">
            Créer la première.
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Link href={`/admin/pages/${p.id}`} className="font-bold text-gray-900 hover:text-[#c2185b]">
                    {p.title}
                  </Link>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.status === "published" ? "Publiée" : "Brouillon"}
                  </span>
                  {p.showInNav ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-[#c2185b]">
                      Dans le menu
                    </span>
                  ) : null}
                </div>
                <div className="text-sm text-gray-500 font-mono">/{p.slug}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {p.blocks.length} bloc{p.blocks.length > 1 ? "s" : ""} · maj{" "}
                  {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.status === "published" ? (
                  <a
                    href={`/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Voir
                  </a>
                ) : null}
                <Link
                  href={`/admin/pages/${p.id}`}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Éditer
                </Link>
                <button
                  onClick={() => deletePage(p.id, p.title)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
