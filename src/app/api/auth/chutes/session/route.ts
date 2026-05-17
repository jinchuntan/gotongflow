import { NextRequest, NextResponse } from "next/server";

import { fetchChutesUserInfo } from "@/lib/chutes-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("chutes_access_token")?.value;

  if (accessToken) {
    return NextResponse.json({
      status: "signed-in",
      user: await fetchChutesUserInfo(accessToken),
      inference: "oauth",
    });
  }

  if (process.env.CHUTES_API_KEY) {
    return NextResponse.json({
      status: "server-key-ready",
      user: null,
      inference: "api-key",
    });
  }

  return NextResponse.json({
    status: "offline",
    user: null,
    inference: "mock",
  });
}
