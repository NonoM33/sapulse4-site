import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deletePage, updatePage } from "@/lib/cms/pages";
import { logAudit } from "@/lib/audit";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const page = await prisma.page.findUnique({
      where: { id: params.id },
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
    });
    if (!page) {
      return NextResponse.json({ error: "Page introuvable" }, { status: 404 });
    }
    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const page = await updatePage(params.id, {
      slug: body.slug,
      title: body.title,
      status: body.status,
      template: body.template,
      showInNav: body.showInNav,
      sortOrder: body.sortOrder,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      ogImageUrl: body.ogImageUrl,
      blocks: Array.isArray(body.blocks) ? body.blocks : undefined,
    });

    await logAudit({
      userId: user.userId,
      userEmail: user.email,
      action: "page.update",
      entityType: "Page",
      entityId: page.id,
      details: { slug: page.slug, status: page.status },
    });

    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const existing = await prisma.page.findUnique({ where: { id: params.id }, select: { slug: true } });
    if (!existing) {
      return NextResponse.json({ error: "Page introuvable" }, { status: 404 });
    }
    await deletePage(params.id);
    await logAudit({
      userId: user.userId,
      userEmail: user.email,
      action: "page.delete",
      entityType: "Page",
      entityId: params.id,
      details: { slug: existing.slug },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
