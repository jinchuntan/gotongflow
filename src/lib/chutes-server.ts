import type { GotongProject, GotongTask, MemberId, TaskStatus } from "@/lib/gotong-types";
import { createMockGotongProject, sampleNotes } from "@/lib/mock-data";

type ChutesChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type ModelAnalysis = {
  goal?: string;
  deadline?: string;
  nextAction?: string;
  fairnessInsight?: string;
  tasks?: Array<{
    id?: string;
    title?: string;
    owner?: string;
    status?: TaskStatus;
    tag?: string;
    shortStatus?: string;
    dependencies?: string[];
    blocker?: string;
    nextMove?: string;
  }>;
};

const chutesBaseUrl = process.env.CHUTES_BASE_URL ?? "https://llm.chutes.ai/v1";
const chutesModel = process.env.CHUTES_MODEL ?? "deepseek-ai/DeepSeek-V3-0324";

export function getServerChutesToken(oauthToken?: string) {
  return oauthToken || process.env.CHUTES_API_KEY || null;
}

export function buildLocalAnalysis(notes: string) {
  return createMockGotongProject(notes || sampleNotes);
}

export async function callChutesInference(notes: string, token: string): Promise<GotongProject> {
  const response = await fetch(`${trimTrailingSlash(chutesBaseUrl)}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: chutesModel,
      temperature: 0.1,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "You extract hackathon teamwork notes into concise JSON for GotongFlow. Return only JSON with keys: goal, deadline, nextAction, fairnessInsight, tasks. Each task needs id, title, owner, status, tag, shortStatus, dependencies, blocker, nextMove. Keep text short. Valid statuses: pending, blocked, verified. Owners are Nigel, Aisha, Wei Jian, Priya.",
        },
        {
          role: "user",
          content: notes,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chutes inference failed: ${response.status} ${errorText.slice(0, 180)}`);
  }

  const data = (await response.json()) as ChutesChatCompletion;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Chutes returned an empty completion.");
  }

  return normalizeModelAnalysis(notes, parseJsonObject(content));
}

function normalizeModelAnalysis(notes: string, analysis: ModelAnalysis): GotongProject {
  const project = buildLocalAnalysis(notes);

  project.goal = sanitize(analysis.goal, project.goal);
  project.deadline = sanitize(analysis.deadline, project.deadline);
  project.nextAction = sanitize(analysis.nextAction, project.nextAction);
  project.fairnessInsight = sanitize(analysis.fairnessInsight, project.fairnessInsight);

  if (Array.isArray(analysis.tasks)) {
    project.tasks = project.tasks.map((task) => {
      const modelTask = findMatchingTask(task, analysis.tasks ?? []);

      if (!modelTask) {
        return task;
      }

      const status = normalizeStatus(modelTask.status, task.status);

      return {
        ...task,
        title: sanitize(modelTask.title, task.title),
        ownerId: normalizeOwner(modelTask.owner, task.ownerId),
        status,
        tag: sanitize(modelTask.tag, task.tag),
        shortStatus: sanitize(modelTask.shortStatus, status === "blocked" ? "Blocked" : task.shortStatus),
        blocker: status === "blocked" ? sanitize(modelTask.blocker, task.blocker ?? "Needs help") : undefined,
        nextMove: sanitize(modelTask.nextMove, task.nextMove ?? "Keep moving"),
      };
    });
  }

  project.blockedTaskIds = project.tasks.filter((task) => task.status === "blocked").map((task) => task.id);
  project.contributionBalance = project.members.map((member) => {
    const ownedTasks = project.tasks.filter((task) => task.ownerId === member.id);

    return {
      memberId: member.id,
      completed: ownedTasks.filter((task) => task.status === "verified").length,
      pending: ownedTasks.filter((task) => task.status === "pending").length,
      blocked: ownedTasks.filter((task) => task.status === "blocked").length,
    };
  });

  return project;
}

function parseJsonObject(content: string): ModelAnalysis {
  const withoutFence = content
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const jsonStart = withoutFence.indexOf("{");
  const jsonEnd = withoutFence.lastIndexOf("}");

  if (jsonStart < 0 || jsonEnd < jsonStart) {
    throw new Error("Chutes response did not contain a JSON object.");
  }

  return JSON.parse(withoutFence.slice(jsonStart, jsonEnd + 1)) as ModelAnalysis;
}

function findMatchingTask(task: GotongTask, candidates: NonNullable<ModelAnalysis["tasks"]>) {
  return candidates.find((candidate) => {
    const id = candidate.id?.toLowerCase();
    const title = candidate.title?.toLowerCase();
    const owner = candidate.owner?.toLowerCase();

    return (
      id === task.id ||
      title === task.title.toLowerCase() ||
      task.title.toLowerCase().includes(title ?? "__missing__") ||
      owner === ownerNameForId(task.ownerId)
    );
  });
}

function normalizeOwner(owner: string | undefined, fallback: MemberId): MemberId {
  const normalized = owner?.toLowerCase().replace(/[^a-z]/g, "");

  if (normalized === "nigel") {
    return "nigel";
  }

  if (normalized === "aisha") {
    return "aisha";
  }

  if (normalized === "weijian") {
    return "wei-jian";
  }

  if (normalized === "priya") {
    return "priya";
  }

  return fallback;
}

function normalizeStatus(status: string | undefined, fallback: TaskStatus): TaskStatus {
  if (status === "blocked" || status === "verified" || status === "pending") {
    return status;
  }

  return fallback;
}

function sanitize(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 96) : fallback;
}

function ownerNameForId(id: MemberId) {
  return id === "wei-jian" ? "wei jian" : id;
}

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
