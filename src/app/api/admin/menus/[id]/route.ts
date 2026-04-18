import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

interface MenuItemInput {
  id?: string;
  label: string;
  url: string;
  target?: string;
  sortOrder?: number;
  parentId?: string | null;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const label = body.label !== undefined ? String(body.label).slice(0, 120) : undefined;
    const items: MenuItemInput[] | undefined = Array.isArray(body.items) ? body.items : undefined;

    await prisma.$transaction(async (tx) => {
      if (label !== undefined) {
        await tx.menu.update({ where: { id: params.id }, data: { label } });
      }
      if (items) {
        await tx.menuItem.deleteMany({ where: { menuId: params.id } });
        if (items.length > 0) {
          await tx.menuItem.createMany({
            data: items.map((item, index) => ({
              menuId: params.id,
              label: String(item.label ?? "").slice(0, 120),
              url: String(item.url ?? "").slice(0, 2048),
              target: item.target === "_blank" ? "_blank" : "_self",
              sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index,
              parentId: null,
            })),
          });
        }
      }
    });

    const menu = await prisma.menu.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] } },
    });

    await logAudit({
      userId: user.userId,
      userEmail: user.email,
      action: "menu.update",
      entityType: "Menu",
      entityId: params.id,
    });

    return NextResponse.json({ menu });
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
    await prisma.menu.delete({ where: { id: params.id } });
    await logAudit({
      userId: user.userId,
      userEmail: user.email,
      action: "menu.delete",
      entityType: "Menu",
      entityId: params.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
