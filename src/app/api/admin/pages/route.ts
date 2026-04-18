import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createPage, listPages } from "@/lib/cms/pages";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await requireAuth();
    const pages = await listPages();
    return NextResponse.json({ pages });
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

    const page = await createPage({
      slug: String(body.slug ?? ""),
      title: String(body.title ?? ""),
      status: body.status === "published" ? "published" : "draft",
      template: body.template ? String(body.template) : "blank",
      showInNav: Boolean(body.showInNav),
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
      ogImageUrl: body.ogImageUrl ?? null,
      authorId: user.userId,
      blocks: Array.isArray(body.blocks) ? body.blocks : [],
    });

    await logAudit({
      userId: user.userId,
      userEmail: user.email,
      action: "page.create",
      entityType: "Page",
      entityId: page.id,
      details: { slug: page.slug, title: page.title, status: page.status },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erreur lors de la création";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
