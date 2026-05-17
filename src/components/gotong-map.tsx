"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CircleAlert,
  FileCheck2,
  HelpCircle,
  PanelRightClose,
  Sparkles,
} from "lucide-react";

import { LandingMapPreview } from "@/components/landing-map-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  GotongEdge,
  GotongProject,
  GotongTask,
  SelectedNode,
  TeamMember,
} from "@/lib/gotong-types";
import { getMemberName } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type GotongMapProps = {
  project: GotongProject | null;
  isAnalyzing: boolean;
  replayKey: number;
  selected: SelectedNode;
  onSelect: (selected: SelectedNode) => void;
  onProofRequest: (taskId: string) => void;
};

const taskWidth = 188;
const taskHeight = 86;

export function GotongMap({
  project,
  isAnalyzing,
  replayKey,
  selected,
  onSelect,
  onProofRequest,
}: GotongMapProps) {
  const selectedMember =
    selected?.kind === "member"
      ? project?.members.find((member) => member.id === selected.id)
      : null;
  const selectedTask =
    selected?.kind === "task"
      ? project?.tasks.find((task) => task.id === selected.id)
      : null;

  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-lg border border-[#251c13]/10 bg-[#fff8ed] shadow-xl shadow-[#2a1608]/10 lg:min-h-[670px]">
      <div className="absolute inset-0 batik-surface opacity-75" />
      <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#2a1608]/10 bg-[#fff8ed]/82 px-4 py-3 backdrop-blur-md">
        <div>
          <div className="text-sm font-semibold text-[#24170f]">Gotong Map</div>
          <div className="text-xs text-[#6f5f4e]">People, blockers, proof</div>
        </div>
        <Badge className="border-[#35c7b3]/30 bg-[#35c7b3]/12 text-[#0b675d]" variant="outline">
          <Sparkles className="size-3" />
          Next Best Move
        </Badge>
      </div>

      {!project ? (
        <div className="absolute inset-0">
          <LandingMapPreview className="opacity-40" />
          <div className="absolute inset-0 bg-[#fff8ed]/74" />
          <div className="absolute inset-x-6 top-28 mx-auto max-w-sm rounded-lg border border-[#2a1608]/10 bg-white/82 p-5 text-center shadow-xl backdrop-blur">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f6b84b]/20 text-[#8a560b]">
              {isAnalyzing ? <Sparkles className="animate-pulse" /> : <HelpCircle />}
            </div>
            <div className="mt-3 text-lg font-semibold text-[#24170f]">
              {isAnalyzing ? "Building the map" : "Ready for notes"}
            </div>
            <div className="mt-1 text-sm text-[#6f5f4e]">
              {isAnalyzing ? "Owners, dependencies, proof nodes." : "Paste chaos. Press analyze."}
            </div>
          </div>
        </div>
      ) : (
        <motion.svg
          aria-label="Interactive Gotong Map"
          className="absolute inset-0 h-full w-full pt-16"
          key={`map-${replayKey}`}
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 1000 650"
        >
          <defs>
            <filter id="verified-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feColorMatrix
                in="blur"
                result="greenGlow"
                type="matrix"
                values="0 0 0 0 0.20 0 0 0 0 0.78 0 0 0 0 0.55 0 0 0 0.85 0"
              />
              <feMerge>
                <feMergeNode in="greenGlow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="blocked-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feColorMatrix
                in="blur"
                result="redGlow"
                type="matrix"
                values="0 0 0 0 1 0 0 0 0 0.30 0 0 0 0 0.30 0 0 0 0.75 0"
              />
              <feMerge>
                <feMergeNode in="redGlow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g opacity="0.22">
            <path d="M90 545 C260 470 355 600 505 524 S776 455 920 525" fill="none" stroke="#35c7b3" strokeWidth="14" />
            <path d="M80 126 C250 78 363 192 518 132 S772 55 918 125" fill="none" stroke="#f6b84b" strokeWidth="12" />
          </g>

          {project.edges.map((edge, index) => (
            <MapEdge edge={edge} index={index} key={edge.id} project={project} />
          ))}

          {project.tasks.map((task, index) => (
            <TaskNode
              index={index}
              isSelected={selected?.kind === "task" && selected.id === task.id}
              key={task.id}
              onSelect={() => onSelect({ kind: "task", id: task.id })}
              ownerName={getMemberName(project, task.ownerId)}
              task={task}
            />
          ))}

          {project.members.map((member, index) => (
            <MemberNode
              index={index}
              isSelected={selected?.kind === "member" && selected.id === member.id}
              key={member.id}
              member={member}
              onSelect={() => onSelect({ kind: "member", id: member.id })}
            />
          ))}
        </motion.svg>
      )}

      {project ? (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center gap-2">
          <div className="rounded-lg border border-[#35c7b3]/25 bg-white/82 px-3 py-2 text-sm font-medium text-[#125b52] shadow-sm backdrop-blur">
            {project.nextAction}
          </div>
          {project.blockedTaskIds.length > 0 ? (
            <div className="rounded-lg border border-[#ff6b6b]/25 bg-[#fff1f1]/90 px-3 py-2 text-sm font-medium text-[#a12b2b] shadow-sm backdrop-blur">
              {project.blockedTaskIds.length} blocked
            </div>
          ) : (
            <div className="rounded-lg border border-[#35c7b3]/25 bg-[#e9fff8]/90 px-3 py-2 text-sm font-medium text-[#0b675d] shadow-sm backdrop-blur">
              No blockers
            </div>
          )}
        </div>
      ) : null}

      <AnimatePresence>
        {(selectedMember || selectedTask) && project ? (
          <motion.aside
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-4 right-4 top-20 z-20 flex w-[min(330px,calc(100%-2rem))] flex-col rounded-lg border border-[#251c13]/10 bg-white/92 p-4 shadow-2xl shadow-[#2a1608]/18 backdrop-blur-xl"
            exit={{ opacity: 0, x: 28 }}
            initial={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge
                  className={cn(
                    "mb-3 border-transparent",
                    selectedTask?.status === "blocked" && "bg-[#ff6b6b]/12 text-[#9f2727]",
                    selectedTask?.status === "verified" && "bg-[#35c7b3]/12 text-[#0b675d]",
                    !selectedTask && "bg-[#f6b84b]/18 text-[#7a4b08]",
                    selectedTask?.status === "pending" && "bg-[#6d8cff]/12 text-[#304ab2]",
                  )}
                >
                  {selectedTask ? selectedTask.shortStatus : "Team Member"}
                </Badge>
                <h2 className="text-xl font-semibold text-[#24170f]">
                  {selectedTask?.title ?? selectedMember?.name}
                </h2>
              </div>
              <Button
                aria-label="Close detail panel"
                onClick={() => onSelect(null)}
                size="icon-sm"
                title="Close"
                type="button"
                variant="ghost"
              >
                <PanelRightClose />
              </Button>
            </div>

            {selectedTask ? (
              <TaskDetail project={project} task={selectedTask} onProofRequest={onProofRequest} />
            ) : null}
            {selectedMember ? <MemberDetail member={selectedMember} project={project} /> : null}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function MemberNode({
  member,
  index,
  isSelected,
  onSelect,
}: {
  member: TeamMember;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.g
      animate={{ opacity: 1, scale: 1 }}
      className="cursor-pointer"
      initial={{ opacity: 0, scale: 0.4 }}
      onClick={onSelect}
      role="button"
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      tabIndex={0}
      transition={{ delay: 0.22 + index * 0.09, type: "spring", stiffness: 180, damping: 18 }}
      whileHover={{ scale: 1.045 }}
    >
      <circle
        cx={member.x}
        cy={member.y}
        fill={member.ring}
        opacity={isSelected ? "0.42" : "0.22"}
        r={isSelected ? 76 : 68}
      />
      <circle cx={member.x} cy={member.y} fill="#fffdf7" r="60" stroke={member.color} strokeWidth="3" />
      <circle cx={member.x} cy={member.y} fill={member.color} opacity="0.94" r="47" />
      <text
        dominantBaseline="middle"
        fill="#1c130d"
        fontFamily="var(--font-geist-sans)"
        fontSize={member.initials.length > 1 ? 24 : 32}
        fontWeight="800"
        textAnchor="middle"
        x={member.x}
        y={member.y + 1}
      >
        {member.initials}
      </text>
      <text
        fill="#24170f"
        fontFamily="var(--font-geist-sans)"
        fontSize="18"
        fontWeight="700"
        textAnchor="middle"
        x={member.x}
        y={member.y + 82}
      >
        {member.name}
      </text>
      <text
        fill="#6f5f4e"
        fontFamily="var(--font-geist-sans)"
        fontSize="13"
        textAnchor="middle"
        x={member.x}
        y={member.y + 103}
      >
        {member.role}
      </text>
    </motion.g>
  );
}

function TaskNode({
  task,
  ownerName,
  index,
  isSelected,
  onSelect,
}: {
  task: GotongTask;
  ownerName: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const statusColor =
    task.status === "verified" ? "#35c7b3" : task.status === "blocked" ? "#ff6b6b" : "#6d8cff";

  return (
    <motion.g
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer"
      filter={task.status === "verified" ? "url(#verified-glow)" : task.status === "blocked" ? "url(#blocked-glow)" : undefined}
      initial={{ opacity: 0, y: 24 }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      transition={{ delay: 0.38 + index * 0.1, duration: 0.42, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <rect
        fill={task.status === "blocked" ? "#fff0ef" : "#ffffff"}
        height={taskHeight}
        rx="12"
        stroke={isSelected ? "#1f130d" : statusColor}
        strokeOpacity={isSelected ? "0.95" : "0.62"}
        strokeWidth={isSelected ? "3" : "2"}
        width={taskWidth}
        x={task.x}
        y={task.y}
      />
      <rect
        fill={statusColor}
        height="9"
        rx="4.5"
        width={task.status === "verified" ? "126" : task.status === "blocked" ? "72" : "96"}
        x={task.x + 16}
        y={task.y + 14}
      />
      <text
        fill="#24170f"
        fontFamily="var(--font-geist-sans)"
        fontSize="18"
        fontWeight="800"
        x={task.x + 16}
        y={task.y + 46}
      >
        {task.title}
      </text>
      <text
        fill="#6f5f4e"
        fontFamily="var(--font-geist-sans)"
        fontSize="13"
        fontWeight="600"
        x={task.x + 16}
        y={task.y + 69}
      >
        {ownerName} / {task.tag}
      </text>
      {task.status === "verified" ? (
        <g>
          <circle cx={task.x + taskWidth - 22} cy={task.y + 22} fill="#0f8f76" r="15" />
          <path
            d={`M ${task.x + taskWidth - 29} ${task.y + 22} L ${task.x + taskWidth - 24} ${task.y + 27} L ${task.x + taskWidth - 15} ${task.y + 17}`}
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      ) : null}
      {task.status === "blocked" ? (
        <motion.g
          animate={{ scale: [1, 1.14, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <circle cx={task.x + taskWidth - 22} cy={task.y + 22} fill="#ff6b6b" r="15" />
          <text
            dominantBaseline="middle"
            fill="#fff"
            fontFamily="var(--font-geist-sans)"
            fontSize="22"
            fontWeight="900"
            textAnchor="middle"
            x={task.x + taskWidth - 22}
            y={task.y + 23}
          >
            !
          </text>
        </motion.g>
      ) : null}
    </motion.g>
  );
}

function MapEdge({
  project,
  edge,
  index,
}: {
  project: GotongProject;
  edge: GotongEdge;
  index: number;
}) {
  const from = getNodePoint(project, edge.from);
  const to = getNodePoint(project, edge.to);
  const color =
    edge.tone === "blocked"
      ? "#ff6b6b"
      : edge.tone === "proof"
        ? "#35c7b3"
        : edge.tone === "dependency"
          ? "#f6b84b"
          : "#4b3828";
  const midX = (from.x + to.x) / 2;

  return (
    <motion.path
      animate={{ pathLength: 1, opacity: edge.tone === "blocked" ? 0.9 : 0.58 }}
      d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      stroke={color}
      strokeDasharray={edge.tone === "blocked" ? "9 12" : undefined}
      strokeLinecap="round"
      strokeWidth={edge.tone === "blocked" ? 4.5 : 3}
      transition={{ delay: 0.08 + index * 0.08, duration: 0.75, ease: "easeOut" }}
    />
  );
}

function TaskDetail({
  project,
  task,
  onProofRequest,
}: {
  project: GotongProject;
  task: GotongTask;
  onProofRequest: (taskId: string) => void;
}) {
  return (
    <div className="mt-5 space-y-4 text-sm">
      <DetailRow label="Owner" value={getMemberName(project, task.ownerId)} />
      <DetailRow label="Next" value={task.nextMove ?? "Keep moving"} />
      {task.blocker ? <DetailRow label="Blocker" tone="danger" value={task.blocker} /> : null}
      {task.proof ? (
        <div className="rounded-lg border border-[#35c7b3]/25 bg-[#effff9] p-3 text-[#0b675d]">
          <div className="flex items-center gap-2 font-semibold">
            <BadgeCheck className="size-4" />
            Proof Added
          </div>
          <div className="mt-1 text-xs text-[#247266]">{task.proof.note}</div>
        </div>
      ) : (
        <Button
          className="w-full bg-[#24170f] text-[#fff8ed] hover:bg-[#3a281a]"
          onClick={() => onProofRequest(task.id)}
          type="button"
        >
          <FileCheck2 />
          Submit Proof
        </Button>
      )}
    </div>
  );
}

function MemberDetail({ member, project }: { member: TeamMember; project: GotongProject }) {
  const ownedTasks = project.tasks.filter((task) => task.ownerId === member.id);

  return (
    <div className="mt-5 space-y-4 text-sm">
      <DetailRow label="Focus" value={member.focus} />
      <div className="space-y-2">
        {ownedTasks.map((task) => (
          <div
            className="flex items-center justify-between rounded-lg border border-[#251c13]/10 bg-[#fff8ed] px-3 py-2"
            key={task.id}
          >
            <span className="font-medium text-[#24170f]">{task.title}</span>
            <span
              className={cn(
                "text-xs font-semibold",
                task.status === "blocked" && "text-[#a12b2b]",
                task.status === "verified" && "text-[#0b675d]",
                task.status === "pending" && "text-[#304ab2]",
              )}
            >
              {task.shortStatus}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "danger"
          ? "border-[#ff6b6b]/25 bg-[#fff1f1] text-[#9f2727]"
          : "border-[#251c13]/10 bg-[#fff8ed] text-[#24170f]",
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#6f5f4e]">
        {tone === "danger" ? <CircleAlert className="size-3" /> : null}
        {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function getNodePoint(project: GotongProject, id: string) {
  const member = project.members.find((item) => item.id === id);
  if (member) {
    return { x: member.x, y: member.y };
  }

  const task = project.tasks.find((item) => item.id === id);
  if (task) {
    return { x: task.x + taskWidth / 2, y: task.y + taskHeight / 2 };
  }

  return { x: 500, y: 325 };
}
