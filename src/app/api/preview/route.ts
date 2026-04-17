import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// Store preview overrides in memory (per-user, short-lived)
const previewStore = new Map<string, { overrides: Record<string, string>; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();
    const { overrides } = body as { overrides?: Record<string, string> };

    if (!overrides || typeof overrides !== "object") {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

    const token = `preview_${payload.userId}_${Date.now()}`;
    previewStore.set(token, {
      overrides,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400 });
  }

  const entry = previewStore.get(token);
  if (!entry || Date.now() > entry.expiresAt) {
    previewStore.delete(token ?? "");
    return NextResponse.json({ error: "Preview expirée" }, { status: 404 });
  }

  return NextResponse.json({ overrides: entry.overrides });
}
