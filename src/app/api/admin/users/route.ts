import { NextRequest, NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;

function requireAdmin(role: string) {
  if (role !== "admin") {
    throw new Error("Accès refusé");
  }
}

export async function GET() {
  try {
    const payload = await requireAuth();
    requireAdmin(payload.role);

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof Error && error.message === "Accès refusé") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    requireAdmin(payload.role);

    const body = await request.json();
    const { email, password, name, role } = body as {
      email?: unknown;
      password?: unknown;
      name?: unknown;
      role?: unknown;
    };

    if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
      return NextResponse.json({ error: "Email, mot de passe et nom requis" }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email) || email.length > 255) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Le nom doit faire entre 2 et 100 caractères" }, { status: 400 });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 });
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
    if (error instanceof Error && error.message === "Accès refusé") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await requireAuth();
    requireAdmin(payload.role);

    const body = await request.json();
    const { id } = body as { id?: unknown };

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    if (id === payload.userId) {
      return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Accès refusé") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
}
