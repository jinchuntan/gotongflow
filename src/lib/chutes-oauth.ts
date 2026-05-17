import crypto from "node:crypto";

import type { NextRequest, NextResponse } from "next/server";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

export type ChutesUserInfo = {
  username?: string;
  email?: string;
  name?: string;
};

const apiBaseUrl = process.env.CHUTES_API_BASE_URL ?? "https://api.chutes.ai";
const idpBaseUrl = process.env.CHUTES_IDP_BASE_URL ?? apiBaseUrl;

export function getOAuthConfig(request?: NextRequest) {
  const clientId = process.env.CHUTES_OAUTH_CLIENT_ID;
  const clientSecret = process.env.CHUTES_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    apiBaseUrl,
    idpBaseUrl,
    redirectUri:
      process.env.CHUTES_OAUTH_REDIRECT_URI ??
      (request ? `${request.nextUrl.origin}/api/auth/chutes/callback` : ""),
    scopes: process.env.CHUTES_OAUTH_SCOPES ?? "openid profile chutes:invoke",
  };
}

export function createPkcePair() {
  const verifier = base64Url(crypto.randomBytes(48));
  const challenge = base64Url(crypto.createHash("sha256").update(verifier).digest());

  return { verifier, challenge };
}

export function createOAuthState() {
  return base64Url(crypto.randomBytes(32));
}

export function buildAuthorizationUrl({
  clientId,
  redirectUri,
  scopes,
  state,
  challenge,
  idpBaseUrl: baseUrl,
}: {
  clientId: string;
  redirectUri: string;
  scopes: string;
  state: string;
  challenge: string;
  idpBaseUrl: string;
}) {
  const url = new URL("/idp/authorize", baseUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  return url;
}

export async function exchangeCodeForTokens({
  code,
  codeVerifier,
  clientId,
  clientSecret,
  redirectUri,
  idpBaseUrl: baseUrl,
}: {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  idpBaseUrl: string;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(new URL("/idp/token", baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Chutes token exchange failed: ${response.status}`);
  }

  return response.json() as Promise<TokenResponse>;
}

export async function fetchChutesUserInfo(accessToken: string) {
  const response = await fetch(new URL("/idp/userinfo", idpBaseUrl), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<ChutesUserInfo>;
}

export function setAuthCookie(
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number,
) {
  response.cookies.set(name, value, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearAuthCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function base64Url(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
