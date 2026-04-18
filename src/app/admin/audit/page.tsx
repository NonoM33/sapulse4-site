"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

interface AuditLog {
  id: string;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: unknown;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  "page.create": "Page créée",
  "page.update": "Page modifiée",
  "page.delete": "Page supprimée",
  "media.upload": "Média importé",
  "media.update": "Média modifié",
  "media.delete": "Média supprimé",
  "menu.create": "Menu créé",
  "menu.update": "Menu modifié",
  "menu.delete": "Menu supprimé",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/audit?limit=100");
        const data = await res.json();
        setLogs(data.logs ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AdminShell title="Historique des modifications">
      <p className="text-sm text-gray-500 mb-6">
        100 dernières actions effectuées sur le site.
      </p>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c2185b] border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-10 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-500">
          Aucune action enregistrée pour l&apos;instant.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-gray-900">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                  <span className="text-gray-500 ml-2">par {log.userEmail ?? "inconnu"}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleString("fr-FR")}
                </span>
              </div>
              {log.details ? (
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  {typeof log.details === "object"
                    ? Object.entries(log.details as Record<string, unknown>)
                        .map(([k, v]) => `${k}: ${String(v)}`)
                        .join(" · ")
                    : String(log.details)}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
