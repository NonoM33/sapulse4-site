import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const contents = await prisma.siteContent.findMany({
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });

    // Group by section with full details
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
    const { key, value } = body as { key?: string; value?: string };

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Clé et valeur requises" },
        { status: 400 }
      );
    }

    const updated = await prisma.siteContent.update({
      where: { key },
      data: { value },
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
    const { updates } = body as { updates?: Array<{ key: string; value: string }> };

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Format invalide : { updates: [{ key, value }] }" },
        { status: 400 }
      );
    }

    const results = await prisma.$transaction(
      updates.map((u) =>
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
