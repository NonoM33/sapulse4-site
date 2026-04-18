import { z } from "zod";

const urlOrPath = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || /^(https?:\/\/|\/|#)/.test(v), { message: "URL invalide" });

export const heroBlockSchema = z.object({
  title: z.string().max(200).default(""),
  subtitle: z.string().max(500).default(""),
  ctaLabel: z.string().max(60).default(""),
  ctaUrl: urlOrPath.default(""),
  imageUrl: z.string().trim().max(2048).default(""),
  align: z.enum(["left", "center"]).default("center"),
});

export const richTextBlockSchema = z.object({
  html: z.string().max(50000).default(""),
});

export const cardsBlockSchema = z.object({
  title: z.string().max(200).default(""),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  items: z
    .array(
      z.object({
        title: z.string().max(120).default(""),
        description: z.string().max(1000).default(""),
        icon: z.string().max(40).default(""),
      })
    )
    .max(12)
    .default([]),
});

export const imageBlockSchema = z.object({
  imageUrl: z.string().trim().max(2048).default(""),
  altText: z.string().max(200).default(""),
  caption: z.string().max(300).default(""),
  width: z.enum(["contain", "wide", "full"]).default("contain"),
});

export const ctaBlockSchema = z.object({
  title: z.string().max(200).default(""),
  subtitle: z.string().max(500).default(""),
  buttonLabel: z.string().max(60).default(""),
  buttonUrl: urlOrPath.default(""),
});

export const personasBlockSchema = z.object({
  title: z.string().max(200).default(""),
  items: z
    .array(
      z.object({
        role: z.string().max(80).default(""),
        benefit: z.string().max(200).default(""),
        description: z.string().max(1000).default(""),
        imageUrl: z.string().trim().max(2048).default(""),
        bullets: z.array(z.string().max(200)).max(8).default([]),
      })
    )
    .max(6)
    .default([]),
});

export const BLOCK_TYPES = {
  hero: { schema: heroBlockSchema, label: "Hero (titre, CTA, image)" },
  richtext: { schema: richTextBlockSchema, label: "Texte libre (éditeur)" },
  cards: { schema: cardsBlockSchema, label: "Cartes (2/3/4 colonnes)" },
  image: { schema: imageBlockSchema, label: "Image seule" },
  cta: { schema: ctaBlockSchema, label: "Appel à l'action" },
  personas: { schema: personasBlockSchema, label: "Personas (colonnes avec image)" },
} as const;

export type BlockType = keyof typeof BLOCK_TYPES;

export function isValidBlockType(type: string): type is BlockType {
  return type in BLOCK_TYPES;
}

export function validateBlockData(type: string, data: unknown): unknown {
  if (!isValidBlockType(type)) {
    throw new Error(`Type de bloc inconnu : ${type}`);
  }
  return BLOCK_TYPES[type].schema.parse(data ?? {});
}

export const blockTypeList = (Object.keys(BLOCK_TYPES) as BlockType[]).map((type) => ({
  type,
  label: BLOCK_TYPES[type].label,
}));
