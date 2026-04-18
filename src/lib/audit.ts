import { prisma } from "./prisma";

interface AuditEntry {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: unknown;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        userEmail: entry.userEmail ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        details: (entry.details as object | null | undefined) ?? undefined,
      },
    });
  } catch (error) {
    console.error("[audit] write failed", error);
  }
}
