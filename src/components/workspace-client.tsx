"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CircleAlert,
  Fingerprint,
  Goal,
  Loader2,
  RotateCcw,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { ContributionReport } from "@/components/contribution-report";
import { GotongMap } from "@/components/gotong-map";
import { ProofSubmissionDialog } from "@/components/proof-submission-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { analyzeTeamNotes, getChutesSession, type ChutesSession } from "@/lib/chutes-agent";
import type {
  ContributionBalance,
  GotongEdge,
  GotongProject,
  ProofAnchor,
  ProofSubmission,
  SelectedNode,
} from "@/lib/gotong-types";
import { getMemberName, sampleNotes } from "@/lib/mock-data";
import { createMockProofAnchor } from "@/lib/proof";
import { cn } from "@/lib/utils";

export function WorkspaceClient() {
  const [notes, setNotes] = useState(sampleNotes);
  const [project, setProject] = useState<GotongProject | null>(null);
  const [selected, setSelected] = useState<SelectedNode>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisVersion, setAnalysisVersion] = useState(0);
  const [proofTaskId, setProofTaskId] = useState<string | null>(null);
  const [proofAnchor, setProofAnchor] = useState<ProofAnchor | null>(null);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [authState, setAuthState] = useState<ChutesSession["status"] | "loading">("loading");
  const [analysisMode, setAnalysisMode] = useState<"idle" | "local-mock" | "chutes">("idle");
  const [analysisMessage, setAnalysisMessage] = useState(getInitialAnalysisMessage);

  const proofTask = useMemo(
    () => project?.tasks.find((task) => task.id === proofTaskId) ?? null,
    [project, proofTaskId],
  );
  const proofOwner = proofTask && project ? getMemberName(project, proofTask.ownerId) : "Team";

  useEffect(() => {
    let active = true;

    getChutesSession().then((session) => {
      if (active) {
        setAuthState(session.status);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setProject(null);
    setSelected(null);
    setProofAnchor(null);

    try {
      const result = await analyzeTeamNotes(notes);
      setProject(recalculateContribution(result.project));
      setAnalysisMode(result.mode);
      setAnalysisMessage(result.message ?? (result.mode === "chutes" ? "Analyzed with Chutes." : "Local mock analysis."));
      setAnalysisVersion((current) => current + 1);
    } catch {
      setAnalysisMessage("Analyzer route failed. Check dev server logs.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleChutesSignIn() {
    window.location.href =
      authState === "signed-in" ? "/api/auth/chutes/logout" : "/api/auth/chutes/login?returnTo=/workspace";
  }

  function handleProofSubmit(taskId: string, proof: ProofSubmission) {
    setProject((current) => {
      if (!current) {
        return current;
      }

      return applyProof(current, taskId, proof);
    });
    setSelected({ kind: "task", id: taskId });
    setProofAnchor(null);
  }

  function handleAnchorProof() {
    if (!project) {
      return;
    }

    setIsAnchoring(true);
    window.setTimeout(() => {
      setProofAnchor(createMockProofAnchor(project));
      setIsAnchoring(false);
    }, 620);
  }

  function handleReset() {
    setProject(null);
    setSelected(null);
    setProofAnchor(null);
    setProofTaskId(null);
    setAnalysisVersion((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-[#f4ecdf] text-[#24170f]">
      <div className="workspace-weave fixed inset-0 opacity-80" />
      <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#251c13]/10 bg-[#fffaf1]/86 px-4 py-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button asChild size="icon-sm" title="Back to landing" variant="ghost">
              <Link href="/">
                <ArrowLeft />
              </Link>
            </Button>
            <div>
              <div className="font-semibold">GotongFlow Workspace</div>
              <div className="text-xs text-[#6f5f4e]">Hackathon team demo</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#6d8cff]/25 bg-[#6d8cff]/12 text-[#334bb2]" variant="outline">
              AI + Web3 MVP
            </Badge>
            <Badge
              className={cn(
                "border-[#251c13]/12 bg-white text-[#6f5f4e]",
                analysisMode === "chutes" && "border-[#35c7b3]/25 bg-[#effff9] text-[#0b675d]",
                analysisMode === "local-mock" && "border-[#f6b84b]/25 bg-[#f6b84b]/14 text-[#76500f]",
              )}
              variant="outline"
            >
              {analysisMode === "chutes" ? "Chutes Live" : analysisMode === "local-mock" ? "Mock AI" : "AI Ready"}
            </Badge>
            <Button
              className={cn(
                "border-[#251c13]/12 bg-white text-[#24170f] hover:bg-[#fff8ed]",
                (authState === "signed-in" || authState === "server-key-ready") &&
                  "border-[#35c7b3]/30 bg-[#effff9] text-[#0b675d]",
              )}
              onClick={handleChutesSignIn}
              size="sm"
              type="button"
              variant="outline"
            >
              <Fingerprint />
              {authState === "loading"
                ? "Checking Chutes"
                : authState === "signed-in"
                  ? "Chutes Signed In"
                  : authState === "server-key-ready"
                    ? "Chutes API Ready"
                    : "Sign in with Chutes"}
            </Button>
            <Button onClick={handleReset} size="icon-sm" title="Reset demo" type="button" variant="ghost">
              <RotateCcw />
            </Button>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)_320px]">
          <aside className="rounded-lg border border-[#251c13]/10 bg-[#fffaf1]/88 p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#6f5f4e]">Input</div>
                <h1 className="text-2xl font-semibold">Messy notes</h1>
              </div>
              <Badge className="border-[#f6b84b]/25 bg-[#f6b84b]/15 text-[#79510f]" variant="outline">
                Raw
              </Badge>
            </div>
            <Textarea
              className="mt-4 min-h-[260px] resize-none border-[#251c13]/12 bg-white/92 text-sm leading-6 shadow-inner"
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
            <Button
              className="mt-4 h-10 w-full bg-[#24170f] text-[#fff8ed] hover:bg-[#3a281a]"
              disabled={isAnalyzing}
              onClick={handleAnalyze}
              type="button"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Analyze Team Notes
            </Button>
            <div className="mt-3 rounded-lg border border-[#251c13]/10 bg-white/70 px-3 py-2 text-xs font-medium text-[#6f5f4e]">
              {analysisMessage}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              {[
                ["4", "people"],
                ["4", "tasks"],
                ["1", "blocker"],
              ].map(([value, label]) => (
                <div className="rounded-lg border border-[#251c13]/10 bg-white/70 p-2" key={label}>
                  <div className="text-lg font-semibold">{value}</div>
                  <div className="text-[#6f5f4e]">{label}</div>
                </div>
              ))}
            </div>
          </aside>

          <GotongMap
            isAnalyzing={isAnalyzing}
            onProofRequest={(taskId) => setProofTaskId(taskId)}
            onSelect={setSelected}
            project={project}
            replayKey={analysisVersion}
            selected={selected}
          />

          <aside className="rounded-lg border border-[#251c13]/10 bg-[#fffaf1]/88 p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-full bg-[#35c7b3]/16 text-[#0b675d]">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#6f5f4e]">AI Action Panel</div>
                <div className="font-semibold">Next move</div>
              </div>
            </div>

            <Separator className="my-4 bg-[#251c13]/10" />

            {project ? (
              <div className="space-y-4">
                <InsightTile icon={<Goal className="size-4" />} label="Project goal" value={project.goal} />
                <InsightTile
                  icon={<Sparkles className="size-4" />}
                  label="Suggested next action"
                  tone="accent"
                  value={project.nextAction}
                />
                <div className="rounded-lg border border-[#251c13]/10 bg-white p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#6f5f4e]">
                    <CircleAlert className="size-3" />
                    Blocked tasks
                  </div>
                  {project.blockedTaskIds.length ? (
                    <div className="space-y-2">
                      {project.blockedTaskIds.map((taskId) => {
                        const task = project.tasks.find((item) => item.id === taskId);
                        return task ? (
                          <button
                            className="flex w-full items-center justify-between rounded-lg bg-[#fff1f1] px-3 py-2 text-left text-sm font-semibold text-[#9f2727]"
                            key={task.id}
                            onClick={() => setSelected({ kind: "task", id: task.id })}
                            type="button"
                          >
                            {task.title}
                            <span className="text-xs">Needs Help</span>
                          </button>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-[#effff9] px-3 py-2 text-sm font-semibold text-[#0b675d]">
                      Clear
                    </div>
                  )}
                </div>
                <InsightTile
                  icon={<UsersRound className="size-4" />}
                  label="Fairness insight"
                  value={project.fairnessInsight}
                />
                <div className="rounded-lg border border-[#35c7b3]/18 bg-[#effff9] p-3 text-sm text-[#0b675d]">
                  <div className="flex items-center gap-2 font-semibold">
                    <BadgeCheck className="size-4" />
                    Proof updates the map live
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {["Project goal", "Next Best Move", "Blocked", "Fairness"].map((label) => (
                  <div className="rounded-lg border border-[#251c13]/10 bg-white/70 p-3" key={label}>
                    <div className="text-xs font-semibold uppercase text-[#6f5f4e]">{label}</div>
                    <div className="mt-2 h-2 w-2/3 rounded-full bg-[#e4d5c2]" />
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        <ContributionReport
          isAnchoring={isAnchoring}
          onAnchorProof={handleAnchorProof}
          project={project}
          proofAnchor={proofAnchor}
        />
      </div>

      <ProofSubmissionDialog
        onOpenChange={(open) => setProofTaskId(open ? proofTaskId : null)}
        onSubmit={handleProofSubmit}
        open={Boolean(proofTask)}
        ownerName={proofOwner}
        task={proofTask}
      />
    </main>
  );
}

function InsightTile({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "accent"
          ? "border-[#35c7b3]/22 bg-[#effff9] text-[#0b675d]"
          : "border-[#251c13]/10 bg-white text-[#24170f]",
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#6f5f4e]">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function getInitialAnalysisMessage() {
  if (typeof window === "undefined") {
    return "Mock demo ready.";
  }

  const authResult = new URLSearchParams(window.location.search).get("auth");

  if (authResult === "missing_chutes_credentials") {
    return "Add Chutes OAuth env vars, or use CHUTES_API_KEY for live inference.";
  }

  if (authResult === "success") {
    return "Signed in with Chutes. Analyze now uses user-scoped inference.";
  }

  if (authResult === "failed") {
    return "Chutes sign-in did not complete. Mock mode is still available.";
  }

  return "Mock demo ready.";
}

function applyProof(project: GotongProject, taskId: string, proof: ProofSubmission): GotongProject {
  let tasks = project.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          status: "verified" as const,
          shortStatus: "Verified",
          blocker: undefined,
          proof,
        }
      : task,
  );

  if (taskId === "chutes-api") {
    tasks = tasks.map((task) =>
      task.id === "frontend-demo"
        ? {
            ...task,
            status: task.status === "blocked" ? ("pending" as const) : task.status,
            shortStatus: task.status === "blocked" ? "Ready" : task.shortStatus,
            blocker: undefined,
            nextMove: "Build against frozen schema",
          }
        : task,
    );
  }

  if (taskId === "frontend-demo") {
    tasks = tasks.map((task) =>
      task.id === "pitch-story"
        ? {
            ...task,
            shortStatus: "Screens ready",
            blocker: undefined,
            nextMove: "Finalize pitch deck",
          }
        : task,
    );
  }

  const blockedTaskIds = tasks.filter((task) => task.status === "blocked").map((task) => task.id);
  const edges = updateEdgeTones(project.edges, taskId, blockedTaskIds.length === 0);
  const completedCount = tasks.filter((task) => task.status === "verified").length;
  const nextAction =
    blockedTaskIds.length > 0
      ? "Freeze Chutes JSON, then unblock Aisha."
      : taskId === "frontend-demo"
        ? "Nigel captures final pitch screenshots."
        : "Aisha ships UI; Nigel captures screenshots.";

  return recalculateContribution({
    ...project,
    tasks,
    edges,
    blockedTaskIds,
    nextAction,
    fairnessInsight:
      completedCount > 0
        ? "Verified proof is visible; effort stays fair."
        : project.fairnessInsight,
  });
}

function updateEdgeTones(edges: GotongEdge[], taskId: string, noBlockers: boolean) {
  return edges.map((edge) => {
    if (taskId === "chutes-api" && edge.id === "dep-api-frontend") {
      return { ...edge, tone: "proof" as const };
    }

    if (noBlockers && edge.tone === "blocked") {
      return { ...edge, tone: "owner" as const };
    }

    return edge;
  });
}

function recalculateContribution(project: GotongProject): GotongProject {
  const contributionBalance: ContributionBalance[] = project.members.map((member) => {
    const ownedTasks = project.tasks.filter((task) => task.ownerId === member.id);

    return {
      memberId: member.id,
      completed: ownedTasks.filter((task) => task.status === "verified").length,
      pending: ownedTasks.filter((task) => task.status === "pending").length,
      blocked: ownedTasks.filter((task) => task.status === "blocked").length,
    };
  });

  return {
    ...project,
    contributionBalance,
  };
}
