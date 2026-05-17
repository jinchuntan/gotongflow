import { baseGotongProject, sampleNotes } from "@/lib/mock-data";
import type { GotongProject } from "@/lib/gotong-types";

export type ChutesAgentResult = {
  project: GotongProject;
  mode: "local-mock" | "chutes";
};

export async function analyzeTeamNotes(notes: string): Promise<ChutesAgentResult> {
  const trimmedNotes = notes.trim() || sampleNotes;

  // First working hackathon demo: deterministic local parsing.
  // Swap this branch with callChutesInference() once Chutes auth is wired.
  await wait(650);

  return {
    mode: "local-mock",
    project: {
      ...baseGotongProject,
      sourceNotes: trimmedNotes,
    },
  };
}

export async function callChutesInference(
  notes: string,
): Promise<GotongProject> {
  // Chutes integration placeholder:
  // 1. Read CHUTES_API_TOKEN from a server-only environment variable.
  // 2. Send notes to a Chutes-hosted model for agentic task extraction.
  // 3. Validate the response against GotongProject before returning it.
  // Never expose the token to client components.
  void notes;
  throw new Error("Chutes inference adapter is not connected yet.");
}

export async function signInWithChutes() {
  // Sign in with Chutes placeholder:
  // 1. Redirect to the Chutes OAuth/auth endpoint.
  // 2. Store the returned session server-side.
  // 3. Use the session to authorize inference and proof actions.
  return { status: "mock-session" as const };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
