import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const section = request.nextUrl.searchParams.get("section");

    const where = section ? { section } : {};
    const contents = await prisma.siteContent.findMany({
      where,
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });

    // Group by section for convenience
    const grouped: Record<string, Record<string, string>> = {};
    for (const item of contents) {
      if (!grouped[item.section]) {
        grouped[item.section] = {};
      }
      grouped[item.section][item.key] = item.value;
    }

    return NextResponse.json({ contents: grouped });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
