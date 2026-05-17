import type { GotongProject, ProofAnchor } from "@/lib/gotong-types";

export function createContributionSnapshot(project: GotongProject) {
  return {
    goal: project.goal,
    generatedAt: new Date().toISOString(),
    tasks: project.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      ownerId: task.ownerId,
      status: task.status,
      proofAdded: Boolean(task.proof),
    })),
    privateDataPolicy: "Private work stays off-chain. Only the proof hash is recorded.",
  };
}

export function createMockProofAnchor(project: GotongProject): ProofAnchor {
  const snapshot = createContributionSnapshot(project);
  const payload = JSON.stringify(snapshot);
  const anchoredAt = new Date().toISOString();

  return {
    proofHash: pseudoSha(`${payload}:proof:${anchoredAt}`, 64),
    transactionHash: pseudoSha(`${payload}:tx:${anchoredAt}`, 64),
    status: "Proof Anchored",
    anchoredAt,
  };
}

export function shortHash(hash: string) {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function pseudoSha(input: string, length: number) {
  let seed = 0x811c9dc5;

  for (let index = 0; index < input.length; index += 1) {
    seed ^= input.charCodeAt(index);
    seed = Math.imul(seed, 0x01000193);
  }

  let hex = "";
  let cursor = seed >>> 0;

  while (hex.length < length) {
    cursor ^= cursor << 13;
    cursor ^= cursor >>> 17;
    cursor ^= cursor << 5;
    hex += (cursor >>> 0).toString(16).padStart(8, "0");
  }

  return `0x${hex.slice(0, length)}`;
}
