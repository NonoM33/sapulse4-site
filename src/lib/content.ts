import { prisma } from "./prisma";

export type ContentMap = Record<string, string>;

/**
 * Load all site content from DB, grouped as a flat key→value map.
 * Returns empty object if DB is unavailable (fallback to hardcoded).
 */
export async function loadSiteContent(): Promise<ContentMap> {
  try {
    const rows = await prisma.siteContent.findMany({
      select: { key: true, value: true },
    });
    const map: ContentMap = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Helper to get a content value with fallback.
 */
export function c(content: ContentMap, key: string, fallback: string): string {
  return content[key] ?? fallback;
}
