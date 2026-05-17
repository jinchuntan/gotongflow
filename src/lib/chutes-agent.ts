import type { GotongProject } from "@/lib/gotong-types";

export type ChutesAgentResult = {
  project: GotongProject;
  mode: "local-mock" | "chutes";
  message?: string;
};

export type ChutesSession =
  | {
      status: "signed-in";
      user: {
        username?: string;
        email?: string;
        name?: string;
      } | null;
      inference: "oauth";
    }
  | {
      status: "server-key-ready";
      user: null;
      inference: "api-key";
    }
  | {
      status: "offline";
      user: null;
      inference: "mock";
    };

export async function analyzeTeamNotes(notes: string): Promise<ChutesAgentResult> {
  const response = await fetch("/api/ai/analyze-notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    throw new Error("Could not analyze team notes.");
  }

  return response.json() as Promise<ChutesAgentResult>;
}

export async function getChutesSession(): Promise<ChutesSession> {
  const response = await fetch("/api/auth/chutes/session", {
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      status: "offline",
      user: null,
      inference: "mock",
    };
  }

  return response.json() as Promise<ChutesSession>;
}
