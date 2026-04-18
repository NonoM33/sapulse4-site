import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageDriver, ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await requireAuth();
    const media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ media });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "").trim().replace(/^\/+|\/+$/g, "");
    const altText = formData.get("altText");
    const title = formData.get("title");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier envoyé" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      return NextResponse.json(
        { error: `Format non supporté. Autorisés : ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Fichier trop lourd (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} Mo)` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const driver = getStorageDriver();

    const uploaded = await driver.upload({
      buffer,
      filename: file.name,
      mimeType: file.type,
      folder: folder || undefined,
    });

    const created = await prisma.media.create({
      data: {
        filename: file.name,
        url: uploaded.url,
        storageKey: uploaded.storageKey,
        driver: uploaded.driver,
        mimeType: file.type,
        sizeBytes: file.size,
        altText: altText ? String(altText) : null,
        title: title ? String(title) : null,
        folder: folder,
      },
    });

    await logAudit({
      userId: user.userId,
      userEmail: user.email,
      action: "media.upload",
      entityType: "Media",
      entityId: created.id,
      details: { filename: created.filename, driver: created.driver, size: created.sizeBytes },
    });

    return NextResponse.json({ media: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erreur lors de l'upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
