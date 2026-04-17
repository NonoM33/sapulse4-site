import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Seuls les admins peuvent créer des utilisateurs" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, role } = body as {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
    };

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, mot de passe et nom requis" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit faire au moins 8 caractères" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashSync(password, 12),
        name,
        role: role === "admin" ? "admin" : "editor",
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await requireAuth();
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Seuls les admins peuvent supprimer des utilisateurs" }, { status: 403 });
    }

    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    if (id === payload.userId) {
      return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
}
