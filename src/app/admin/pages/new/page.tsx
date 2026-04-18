"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { PageEditor } from "@/components/admin/page-editor";

export default function NewPage() {
  return (
    <AdminShell title="Nouvelle page">
      <p className="text-sm text-gray-500 mb-6">
        Choisissez un titre et un slug, puis ajoutez des blocs de contenu.
        La page reste en brouillon tant que vous ne la publiez pas.
      </p>
      <PageEditor />
    </AdminShell>
  );
}
