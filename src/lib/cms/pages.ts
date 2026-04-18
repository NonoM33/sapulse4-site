import { prisma } from "../prisma";
import { validateBlockData } from "./blocks";

export const RESERVED_SLUGS = ["admin", "api", "_next", "uploads", "images", "favicon.ico"];

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > 80) return false;
  if (RESERVED_SLUGS.includes(slug)) return false;
  return SLUG_REGEX.test(slug);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

interface BlockInput {
  type: string;
  data: unknown;
  sortOrder?: number;
}

interface UpsertPageInput {
  slug: string;
  title: string;
  status: "draft" | "published";
  template?: string;
  showInNav?: boolean;
  sortOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  authorId?: string | null;
  blocks: BlockInput[];
}

export async function createPage(input: UpsertPageInput) {
  if (!isValidSlug(input.slug)) {
    throw new Error("Slug invalide : utilisez des minuscules, chiffres et tirets uniquement");
  }

  const existing = await prisma.page.findUnique({ where: { slug: input.slug } });
  if (existing) {
    throw new Error("Une page existe déjà avec ce slug");
  }

  const validatedBlocks = input.blocks.map((b, i) => ({
    type: b.type,
    sortOrder: b.sortOrder ?? i,
    data: validateBlockData(b.type, b.data) as object,
  }));

  return prisma.page.create({
    data: {
      slug: input.slug,
      title: input.title,
      status: input.status,
      template: input.template ?? "blank",
      showInNav: input.showInNav ?? false,
      sortOrder: input.sortOrder ?? 0,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      ogImageUrl: input.ogImageUrl ?? null,
      authorId: input.authorId ?? null,
      publishedAt: input.status === "published" ? new Date() : null,
      blocks: {
        create: validatedBlocks,
      },
    },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function updatePage(id: string, input: Partial<UpsertPageInput>) {
  if (input.slug !== undefined && !isValidSlug(input.slug)) {
    throw new Error("Slug invalide");
  }
  if (input.slug) {
    const conflict = await prisma.page.findFirst({
      where: { slug: input.slug, NOT: { id } },
      select: { id: true },
    });
    if (conflict) {
      throw new Error("Ce slug est déjà utilisé");
    }
  }

  const existing = await prisma.page.findUnique({ where: { id }, select: { status: true, publishedAt: true } });
  if (!existing) throw new Error("Page introuvable");

  let publishedAt = existing.publishedAt;
  if (input.status === "published" && existing.status !== "published") {
    publishedAt = new Date();
  }
  if (input.status === "draft") {
    publishedAt = null;
  }

  return prisma.$transaction(async (tx) => {
    if (input.blocks) {
      const validated = input.blocks.map((b, i) => ({
        type: b.type,
        sortOrder: b.sortOrder ?? i,
        data: validateBlockData(b.type, b.data) as object,
      }));
      await tx.pageBlock.deleteMany({ where: { pageId: id } });
      if (validated.length > 0) {
        await tx.pageBlock.createMany({
          data: validated.map((b) => ({ ...b, pageId: id })),
        });
      }
    }

    const updateData: Record<string, unknown> = {
      publishedAt,
    };
    const copyKeys = [
      "slug",
      "title",
      "status",
      "template",
      "showInNav",
      "sortOrder",
      "metaTitle",
      "metaDescription",
      "ogImageUrl",
    ] as const;
    for (const key of copyKeys) {
      if (input[key] !== undefined) {
        updateData[key] = input[key];
      }
    }

    return tx.page.update({
      where: { id },
      data: updateData,
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
    });
  });
}

export async function deletePage(id: string) {
  await prisma.page.delete({ where: { id } });
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findUnique({
    where: { slug },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function listPages() {
  return prisma.page.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getPublishedPageBySlug(slug: string) {
  return prisma.page.findFirst({
    where: { slug, status: "published" },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function listPublishedPagesInNav() {
  return prisma.page.findMany({
    where: { status: "published", showInNav: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true, sortOrder: true },
  });
}
