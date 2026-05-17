import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/chutes-oauth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/workspace?auth=signed_out", request.url));

  for (const name of [
    "chutes_access_token",
    "chutes_refresh_token",
    "chutes_oauth_state",
    "chutes_pkce_verifier",
    "chutes_return_to",
  ]) {
    clearAuthCookie(response, name);
  }

  return response;
}
