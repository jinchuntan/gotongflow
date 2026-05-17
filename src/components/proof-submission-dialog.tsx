"use client";

import { FormEvent, useState } from "react";
import { Camera, FileText, GitCommitHorizontal, Link2, ShieldCheck, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { GotongTask, ProofSubmission } from "@/lib/gotong-types";

type ProofSubmissionDialogProps = {
  open: boolean;
  task: GotongTask | null;
  ownerName: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskId: string, proof: ProofSubmission) => void;
};

const initialForm = {
  githubUrl: "https://github.com/gotongflow/demo/commit/a1b2c3d",
  documentUrl: "https://docs.gotongflow.dev/hackathon-demo",
  screenshotName: "gotong-map-proof.png",
  note: "Demo-ready slice completed.",
};

export function ProofSubmissionDialog({
  open,
  task,
  ownerName,
  onOpenChange,
  onSubmit,
}: ProofSubmissionDialogProps) {
  const [form, setForm] = useState(initialForm);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task) {
      return;
    }

    onSubmit(task.id, {
      ...form,
      note: form.note.trim() || `${task.title} is ready for review.`,
      submittedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg border-[#251c13]/12 bg-[#fffaf1] text-[#24170f]">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <Badge className="border-[#35c7b3]/25 bg-[#35c7b3]/12 text-[#0b675d]" variant="outline">
              <ShieldCheck className="size-3" />
              Proof Submission
            </Badge>
          </div>
          <DialogTitle className="text-2xl">{task?.title ?? "Submit Proof"}</DialogTitle>
          <DialogDescription className="text-[#6f5f4e]">
            {ownerName} adds links. The map verifies the task.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold">
            <span className="mb-1 flex items-center gap-2 text-[#493728]">
              <GitCommitHorizontal className="size-4" />
              GitHub commit
            </span>
            <input
              className="h-10 w-full rounded-lg border border-[#251c13]/12 bg-white px-3 text-sm outline-none ring-[#35c7b3]/20 transition focus:ring-4"
              onChange={(event) => setForm((current) => ({ ...current, githubUrl: event.target.value }))}
              value={form.githubUrl}
            />
          </label>

          <label className="block text-sm font-semibold">
            <span className="mb-1 flex items-center gap-2 text-[#493728]">
              <Link2 className="size-4" />
              Document link
            </span>
            <input
              className="h-10 w-full rounded-lg border border-[#251c13]/12 bg-white px-3 text-sm outline-none ring-[#35c7b3]/20 transition focus:ring-4"
              onChange={(event) => setForm((current) => ({ ...current, documentUrl: event.target.value }))}
              value={form.documentUrl}
            />
          </label>

          <div className="rounded-lg border border-dashed border-[#251c13]/18 bg-white/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#493728]">
                <Camera className="size-4" />
                Screenshot
              </div>
              <Button
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    screenshotName: "workspace-proof-screenshot.png",
                  }))
                }
                size="sm"
                type="button"
                variant="outline"
              >
                <Upload />
                Attach
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[#6f5f4e]">
              <FileText className="size-3" />
              {form.screenshotName}
            </div>
          </div>

          <label className="block text-sm font-semibold">
            <span className="mb-1 text-[#493728]">Short note</span>
            <Textarea
              className="min-h-20 border-[#251c13]/12 bg-white text-sm"
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              value={form.note}
            />
          </label>

          <Button className="h-10 w-full bg-[#24170f] text-[#fff8ed] hover:bg-[#3a281a]" type="submit">
            <ShieldCheck />
            Verify Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
