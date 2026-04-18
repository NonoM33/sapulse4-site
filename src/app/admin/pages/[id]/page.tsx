"use client";

import { useEffect, useState, use } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageEditor } from "@/components/admin/page-editor";

interface LoadedPage {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  showInNav: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  blocks: Array<{ id: string; type: string; data: unknown }>;
}

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [page, setPage] = useState<LoadedPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/pages/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur");
        setPage(data.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      }
    }
    load();
  }, [id]);

  if (error) {
    return (
      <AdminShell title="Édition de page">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      </AdminShell>
    );
  }

  if (!page) {
    return (
      <AdminShell title="Édition de page">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c2185b] border-t-transparent" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Édition : ${page.title}`}>
      <PageEditor
        pageId={page.id}
        initial={{
          slug: page.slug,
          title: page.title,
          status: page.status,
          showInNav: page.showInNav,
          sortOrder: page.sortOrder,
          metaTitle: page.metaTitle ?? "",
          metaDescription: page.metaDescription ?? "",
          ogImageUrl: page.ogImageUrl ?? "",
          blocks: page.blocks.map((b) => ({ type: b.type as "hero", data: b.data as Record<string, unknown>, id: b.id })),
        }}
      />
    </AdminShell>
  );
}
