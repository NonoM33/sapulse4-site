import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const dbHost = dbUrl.replace(/^postgres(ql)?:\/\/[^@]*@/, "").split("/")[0];
  const appEnv = process.env.APP_ENV ?? null;
  const jwtPrefix = (process.env.JWT_SECRET ?? "").slice(0, 12);

  let userCount = 0;
  let adminHashPrefix: string | null = null;
  try {
    userCount = await prisma.user.count();
    const admin = await prisma.user.findFirst({
      where: { email: process.env.ADMIN_EMAIL ?? "admin@bkpulse.fr" },
      select: { password: true, updatedAt: true },
    });
    if (admin) {
      adminHashPrefix = admin.password.slice(0, 20);
    }
  } catch (e) {
    return NextResponse.json({ error: String(e), dbHost, appEnv, jwtPrefix }, { status: 500 });
  }

  return NextResponse.json({ dbHost, appEnv, jwtPrefix, userCount, adminHashPrefix });
}
