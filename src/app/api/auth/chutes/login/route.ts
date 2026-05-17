import { NextRequest, NextResponse } from "next/server";

import {
  buildAuthorizationUrl,
  createOAuthState,
  createPkcePair,
  getOAuthConfig,
  setAuthCookie,
} from "@/lib/chutes-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const config = getOAuthConfig(request);
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/workspace";

  if (!config) {
    return NextResponse.redirect(new URL(`${returnTo}?auth=missing_chutes_credentials`, request.url));
  }

  const state = createOAuthState();
  const { verifier, challenge } = createPkcePair();
  const authUrl = buildAuthorizationUrl({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scopes: config.scopes,
    state,
    challenge,
    idpBaseUrl: config.idpBaseUrl,
  });
  const response = NextResponse.redirect(authUrl);

  setAuthCookie(response, "chutes_oauth_state", state, 10 * 60);
  setAuthCookie(response, "chutes_pkce_verifier", verifier, 10 * 60);
  setAuthCookie(response, "chutes_return_to", returnTo, 10 * 60);

  return response;
}
