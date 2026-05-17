export type MemberId = "nigel" | "aisha" | "wei-jian" | "priya";

export type TaskStatus = "pending" | "blocked" | "verified";

export type NodeKind = "member" | "task";

export type ProofSubmission = {
  githubUrl: string;
  documentUrl: string;
  screenshotName: string;
  note: string;
  submittedAt: string;
};

export type TeamMember = {
  id: MemberId;
  name: string;
  initials: string;
  role: string;
  focus: string;
  color: string;
  ring: string;
  x: number;
  y: number;
};

export type GotongTask = {
  id: string;
  title: string;
  ownerId: MemberId;
  status: TaskStatus;
  tag: string;
  shortStatus: string;
  dependencyIds: string[];
  blocker?: string;
  nextMove?: string;
  proof?: ProofSubmission;
  x: number;
  y: number;
};

export type GotongEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  tone: "owner" | "dependency" | "blocked" | "proof";
};

export type ContributionBalance = {
  memberId: MemberId;
  completed: number;
  pending: number;
  blocked: number;
};

export type GotongProject = {
  goal: string;
  deadline: string;
  sourceNotes: string;
  members: TeamMember[];
  tasks: GotongTask[];
  edges: GotongEdge[];
  blockedTaskIds: string[];
  nextAction: string;
  fairnessInsight: string;
  contributionBalance: ContributionBalance[];
};

export type SelectedNode =
  | { kind: "member"; id: MemberId }
  | { kind: "task"; id: string }
  | null;

export type ProofAnchor = {
  proofHash: string;
  transactionHash: string;
  status: "Proof Anchored";
  anchoredAt: string;
};
