import { NextRequest, NextResponse } from "next/server";

const UMAMI_URL = "http://umami-dqgw22zg0phqaqwbm4mkh0of.204.168.183.38.sslip.io";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const res = await fetch(`${UMAMI_URL}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "",
      },
      body,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new NextResponse("{}", { status: 502 });
  }
}
