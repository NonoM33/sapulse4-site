import { NextRequest, NextResponse } from "next/server";

const OP_API = "http://opapi-gqb1vf3qv01xm8dg234traw3.204.168.183.38.sslip.io";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const res = await fetch(`${OP_API}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "",
        "openpanel-client-id": "fc4b026a-f705-44d6-8f86-627bb3481d0f",
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

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
