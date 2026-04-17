import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("FATAL: JWT_SECRET environment variable is required");
  }
  return secret ?? "dev-secret-local-only";
}

const TOKEN_COOKIE = "bkpulse_token";
const TOKEN_EXPIRY = "2h";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRY, algorithm: "HS256" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] }) as TokenPayload;
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}

export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE !== "false",
    sameSite: "lax",
    maxAge: 2 * 60 * 60, // 2h
    path: "/",
  });
}

export async function clearTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function requireAuth(): Promise<TokenPayload> {
  const token = await getTokenFromCookies();
  if (!token) {
    throw new Error("Non authentifié");
  }
  const payload = verifyToken(token);

  // Validate user still exists and role matches
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== payload.role) {
    throw new Error("Non authentifié");
  }

  return payload;
}
