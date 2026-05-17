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

- Copy `.env.example` to `.env.local`.
- Add `CHUTES_API_KEY` for live shared Chutes inference.
- Optional: add `CHUTES_OAUTH_CLIENT_ID` and `CHUTES_OAUTH_CLIENT_SECRET` for Sign in with Chutes.
- The app uses server routes so tokens and client secrets never reach browser code.

### Live AI Route

- `src/app/api/ai/analyze-notes/route.ts`
- Uses the signed-in user's OAuth token first.
- Falls back to `CHUTES_API_KEY`.
- Falls back to local mock analysis if no Chutes credential exists or inference fails.

### Sign in with Chutes Routes

- `/api/auth/chutes/login`
- `/api/auth/chutes/callback`
- `/api/auth/chutes/session`
- `/api/auth/chutes/logout`

The OAuth flow uses Authorization Code + PKCE and stores tokens in HttpOnly cookies.

### Required Chutes Env Vars

```bash
CHUTES_API_KEY=cpk_...
CHUTES_BASE_URL=https://llm.chutes.ai/v1
CHUTES_MODEL=deepseek-ai/DeepSeek-V3-0324
```

For OAuth:

```bash
CHUTES_OAUTH_CLIENT_ID=cid_...
CHUTES_OAUTH_CLIENT_SECRET=csc_...
CHUTES_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/chutes/callback
CHUTES_OAUTH_SCOPES="openid profile chutes:invoke"
```

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
