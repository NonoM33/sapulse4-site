import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const KEY_REGEX = /^[a-zA-Z0-9._]+$/;
const MAX_KEY_LENGTH = 100;
const MAX_VALUE_LENGTH = 5000;
const MAX_BATCH_SIZE = 50;

function validateKeyValue(key: unknown, value: unknown): string | null {
  if (typeof key !== "string" || typeof value !== "string") {
    return "Clé et valeur doivent être des chaînes de caractères";
  }
  if (!key || key.length > MAX_KEY_LENGTH || !KEY_REGEX.test(key)) {
    return "Clé invalide";
  }
  if (value.length > MAX_VALUE_LENGTH) {
    return `La valeur ne peut pas dépasser ${MAX_VALUE_LENGTH} caractères`;
  }
  return null;
}

export async function GET() {
  try {
    await requireAuth();

    const contents = await prisma.siteContent.findMany({
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });

    const sections: Record<string, Array<{
      id: string;
      key: string;
      value: string;
      label: string;
      sortOrder: number;
    }>> = {};

    for (const item of contents) {
      if (!sections[item.section]) {
        sections[item.section] = [];
      }
      sections[item.section].push({
        id: item.id,
        key: item.key,
        value: item.value,
        label: item.label,
        sortOrder: item.sortOrder,
      });
    }

    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { key, value } = body as { key?: unknown; value?: unknown };

    const validationError = validateKeyValue(key, value);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const updated = await prisma.siteContent.update({
      where: { key: key as string },
      data: { value: value as string },
    });

    return NextResponse.json({ content: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { updates } = body as { updates?: unknown };

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Format invalide : { updates: [{ key, value }] }" },
        { status: 400 }
      );
    }

    if (updates.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BATCH_SIZE} modifications par requête` },
        { status: 400 }
      );
    }

    for (const u of updates) {
      const validationError = validateKeyValue(u?.key, u?.value);
      if (validationError) {
        return NextResponse.json({ error: `${validationError} (clé: ${u?.key})` }, { status: 400 });
      }
    }

    const results = await prisma.$transaction(
      updates.map((u: { key: string; value: string }) =>
        prisma.siteContent.update({
          where: { key: u.key },
          data: { value: u.value },
        })
      )
    );

    return NextResponse.json({ updated: results.length });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
