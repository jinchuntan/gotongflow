# GotongFlow

GotongFlow is a polished hackathon MVP for Chutes Hack Malaysia 2026. It turns messy team notes into a visual collaboration map, then lets a team submit proof of work and anchor a mock proof hash.

## Problem

Teamwork gets messy fast: unclear ownership, hidden blockers, and uneven credit. GotongFlow makes contribution visible without exposing private work.

## Demo Flow

1. Open the landing page and enter the workspace.
2. Paste the sample notes or use the prefilled notes.
3. Click **Analyze Team Notes**.
4. Explore the interactive **Gotong Map**.
5. Submit proof on a task.
6. Click **Anchor Proof** in the contribution report.

## AI

- `src/lib/chutes-agent.ts` contains the mock AI agent.
- The current demo parses the sample notes into structured JSON locally.
- The adapter includes a placeholder `callChutesInference()` function for real Chutes inference.
- No API key is required for the MVP.

## Web3

- `src/lib/proof.ts` creates a mock SHA-style proof hash and fake transaction hash.
- The report shows **Proof Anchored** after anchoring.
- Private links and notes stay off-chain; only the contribution snapshot hash is recorded.

## Chutes Integration Path

- Add a server-only `CHUTES_API_TOKEN`.
- Replace the local mock branch in `analyzeTeamNotes()` with `callChutesInference()`.
- Wire the Sign in with Chutes button to the real Chutes auth flow in `signInWithChutes()`.
- Validate the model response against the `GotongProject` shape before rendering.

## Tech Stack

- Next.js App Router
- React
- Tailwind CSS
- shadcn/ui primitives
- Framer Motion
- Lucide icons
- Custom SVG Gotong Map

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
```
