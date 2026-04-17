import { NextResponse } from "next/server";

const UMAMI_URL = "http://umami-dqgw22zg0phqaqwbm4mkh0of.204.168.183.38.sslip.io";

export async function GET() {
  try {
    const res = await fetch(`${UMAMI_URL}/script.js`, { cache: "no-store" });
    const script = await res.text();

    return new NextResponse(script, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("", { status: 502 });
  }
}
