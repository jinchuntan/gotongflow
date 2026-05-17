import { NextRequest, NextResponse } from "next/server";

import {
  clearAuthCookie,
  exchangeCodeForTokens,
  getOAuthConfig,
  setAuthCookie,
} from "@/lib/chutes-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const config = getOAuthConfig(request);
  const returnTo = request.cookies.get("chutes_return_to")?.value || "/workspace";

  if (!config) {
    return NextResponse.redirect(new URL(`${returnTo}?auth=missing_chutes_credentials`, request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("chutes_oauth_state")?.value;
  const codeVerifier = request.cookies.get("chutes_pkce_verifier")?.value;

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return NextResponse.redirect(new URL(`${returnTo}?auth=failed`, request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      idpBaseUrl: config.idpBaseUrl,
    });
    const response = NextResponse.redirect(new URL(`${returnTo}?auth=success`, request.url));

    setAuthCookie(response, "chutes_access_token", tokens.access_token, tokens.expires_in ?? 60 * 60);

    if (tokens.refresh_token) {
      setAuthCookie(response, "chutes_refresh_token", tokens.refresh_token, 30 * 24 * 60 * 60);
    }

    clearTransientCookies(response);

    return response;
  } catch (error) {
    console.error(error);

    const response = NextResponse.redirect(new URL(`${returnTo}?auth=failed`, request.url));
    clearTransientCookies(response);

    return response;
  }
}

function clearTransientCookies(response: NextResponse) {
  clearAuthCookie(response, "chutes_oauth_state");
  clearAuthCookie(response, "chutes_pkce_verifier");
  clearAuthCookie(response, "chutes_return_to");
}
