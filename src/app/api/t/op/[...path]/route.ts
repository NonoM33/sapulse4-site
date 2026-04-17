import { NextRequest, NextResponse } from "next/server";

const OP_API = "http://opapi-gqb1vf3qv01xm8dg234traw3.204.168.183.38.sslip.io";
const OP_CLIENT_ID = "fc4b026a-f705-44d6-8f86-627bb3481d0f";
const OP_CLIENT_SECRET = "sec_10f8962df499abe6d40b";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const targetPath = path.join("/");
    const body = await request.text();

    const res = await fetch(`${OP_API}/${targetPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "",
        "openpanel-client-id": OP_CLIENT_ID,
        "openpanel-client-secret": OP_CLIENT_SECRET,
      },
      body,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("{}", { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, openpanel-client-id",
    },
  });
}
