import { NextRequest, NextResponse } from "next/server";

import { buildLocalAnalysis, callChutesInference, getServerChutesToken } from "@/lib/chutes-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { notes?: string };
  const notes = body.notes?.trim() ?? "";
  const oauthToken = request.cookies.get("chutes_access_token")?.value;
  const token = getServerChutesToken(oauthToken);

  if (!token) {
    return NextResponse.json({
      mode: "local-mock",
      message: "Add CHUTES_API_KEY or Sign in with Chutes to use live inference.",
      project: buildLocalAnalysis(notes),
    });
  }

  try {
    const project = await callChutesInference(notes, token);

    return NextResponse.json({
      mode: "chutes",
      message: oauthToken ? "Analyzed with Sign in with Chutes." : "Analyzed with CHUTES_API_KEY.",
      project,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      mode: "local-mock",
      message: "Chutes inference failed, so the demo stayed live with local mock analysis.",
      project: buildLocalAnalysis(notes),
    });
  }
}
