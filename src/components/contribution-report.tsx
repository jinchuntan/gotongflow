"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, CircleAlert, FileKey2, Shield, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { GotongProject, ProofAnchor } from "@/lib/gotong-types";
import { shortHash } from "@/lib/proof";

type ContributionReportProps = {
  project: GotongProject | null;
  proofAnchor: ProofAnchor | null;
  isAnchoring: boolean;
  onAnchorProof: () => void;
};

export function ContributionReport({
  project,
  proofAnchor,
  isAnchoring,
  onAnchorProof,
}: ContributionReportProps) {
  if (!project) {
    return (
      <section className="rounded-lg border border-[#251c13]/10 bg-white/70 p-5 text-[#6f5f4e]">
        Analyze notes to generate a contribution report.
      </section>
    );
  }

  const verifiedTasks = project.tasks.filter((task) => task.status === "verified");
  const blockedTasks = project.tasks.filter((task) => task.status === "blocked");

  return (
    <section
      className="rounded-lg border border-[#251c13]/10 bg-[#fffaf1] p-4 shadow-lg shadow-[#2a1608]/8 sm:p-5"
      id="report"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#6f5f4e]">Contribution Report</div>
          <h2 className="text-2xl font-semibold text-[#24170f]">Fair work snapshot</h2>
        </div>
        <Button
          className="bg-[#24170f] text-[#fff8ed] hover:bg-[#3a281a]"
          disabled={isAnchoring}
          onClick={onAnchorProof}
          type="button"
        >
          <FileKey2 />
          {proofAnchor ? "Refresh Hash" : isAnchoring ? "Anchoring" : "Anchor Proof"}
        </Button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.9fr_0.95fr]">
        <div className="rounded-lg border border-[#251c13]/10 bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="font-semibold text-[#24170f]">Contribution balance</div>
            <Badge className="border-[#f6b84b]/25 bg-[#f6b84b]/14 text-[#76500f]" variant="outline">
              Balanced
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.contributionBalance.map((balance) => {
              const member = project.members.find((item) => item.id === balance.memberId);
              const total = Math.max(balance.completed + balance.pending + balance.blocked, 1);
              const completedPercent = Math.round((balance.completed / total) * 100);

              return (
                <div className="flex items-center gap-3" key={balance.memberId}>
                  <div
                    className="grid size-14 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(${member?.color ?? "#35c7b3"} ${completedPercent}%, #efe2d1 0)`,
                    }}
                  >
                    <div className="grid size-10 place-items-center rounded-full bg-white text-xs font-bold text-[#24170f]">
                      {completedPercent}%
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-[#24170f]">{member?.name}</span>
                      <span className="text-xs text-[#6f5f4e]">
                        {balance.completed}/{total}
                      </span>
                    </div>
                    <Progress className="mt-2 h-2 bg-[#efe2d1]" value={completedPercent} />
                    <div className="mt-1 text-xs text-[#6f5f4e]">
                      {balance.blocked ? `${balance.blocked} blocked` : `${balance.pending} pending`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-[#251c13]/10 bg-white p-4">
          <div className="mb-4 font-semibold text-[#24170f]">Completed</div>
          <div className="space-y-2">
            {verifiedTasks.length ? (
              verifiedTasks.map((task) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-[#35c7b3]/18 bg-[#effff9] px-3 py-2"
                  key={task.id}
                >
                  <span className="font-medium text-[#0b675d]">{task.title}</span>
                  <BadgeCheck className="size-4 text-[#0f8f76]" />
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-[#251c13]/10 bg-[#fff8ed] px-3 py-3 text-sm text-[#6f5f4e]">
                Waiting for first proof.
              </div>
            )}
          </div>

          <div className="mt-5 font-semibold text-[#24170f]">Blocked</div>
          <div className="mt-2 space-y-2">
            {blockedTasks.length ? (
              blockedTasks.map((task) => (
                <div
                  className="flex items-center gap-2 rounded-lg border border-[#ff6b6b]/20 bg-[#fff1f1] px-3 py-2 text-sm text-[#9f2727]"
                  key={task.id}
                >
                  <CircleAlert className="size-4" />
                  {task.title}
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-[#35c7b3]/18 bg-[#effff9] px-3 py-2 text-sm text-[#0b675d]">
                No blockers.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#251c13]/10 bg-[#24170f] p-4 text-[#fff8ed]">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-[#f6b84b]" />
            Team should do next
          </div>
          <div className="mt-3 rounded-lg bg-[#fff8ed]/10 p-3 text-sm text-[#fff0d4]">
            {project.nextAction}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#fff0d4]">
            <Shield className="size-4 text-[#35c7b3]" />
            Hash only. Private work stays off-chain.
          </div>

          <AnimatePresence mode="popLayout">
            {proofAnchor ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-[#35c7b3]/35 bg-[#35c7b3]/12 p-3"
                exit={{ opacity: 0, y: 10 }}
                initial={{ opacity: 0, y: 10 }}
                key={proofAnchor.proofHash}
              >
                <Badge className="border-[#35c7b3]/25 bg-[#35c7b3]/18 text-[#9ff6ea]" variant="outline">
                  Proof Anchored
                </Badge>
                <div className="mt-3 space-y-2 font-mono text-xs text-[#dffdf8]">
                  <div>proof {shortHash(proofAnchor.proofHash)}</div>
                  <div>tx {shortHash(proofAnchor.transactionHash)}</div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
