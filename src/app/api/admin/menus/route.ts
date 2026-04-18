import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const MENU_KEY_REGEX = /^[a-z0-9_-]{1,40}$/;

export async function GET() {
  try {
    await requireAuth();
    const menus = await prisma.menu.findMany({
      orderBy: { key: "asc" },
      include: {
        items: {
          orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
        },
      },
    });
    return NextResponse.json({ menus });
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
    const body = await request.json();
    const key = String(body.key ?? "").trim();
    const label = String(body.label ?? "").trim();

    if (!MENU_KEY_REGEX.test(key)) {
      return NextResponse.json({ error: "Clé de menu invalide" }, { status: 400 });
    }
    if (!label) {
      return NextResponse.json({ error: "Libellé requis" }, { status: 400 });
    }

    const menu = await prisma.menu.create({
      data: { key, label },
      include: { items: true },
    });

    await logAudit({
      userId: user.userId,
      userEmail: user.email,
      action: "menu.create",
      entityType: "Menu",
      entityId: menu.id,
      details: { key, label },
    });

    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
