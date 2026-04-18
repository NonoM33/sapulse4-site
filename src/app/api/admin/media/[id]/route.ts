import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageDriver } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const updated = await prisma.media.update({
      where: { id: params.id },
      data: {
        altText: body.altText !== undefined ? String(body.altText).slice(0, 200) : undefined,
        title: body.title !== undefined ? String(body.title).slice(0, 200) : undefined,
      },
    });

    await logAudit({
      userId: user.userId,
      userEmail: user.email,
      action: "media.update",
      entityType: "Media",
      entityId: params.id,
    });

    return NextResponse.json({ media: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const media = await prisma.media.findUnique({ where: { id: params.id } });
    if (!media) {
      return NextResponse.json({ error: "Média introuvable" }, { status: 404 });
    }

    try {
      const driver = getStorageDriver();
      if (driver.name === media.driver) {
        await driver.delete(media.storageKey);
      }
    } catch (err) {
      console.error("[media] delete storage failed", err);
    }

    await prisma.media.delete({ where: { id: params.id } });

    await logAudit({
      userId: user.userId,
      userEmail: user.email,
      action: "media.delete",
      entityType: "Media",
      entityId: params.id,
      details: { filename: media.filename },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
