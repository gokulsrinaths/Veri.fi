# VeriAct — AI-Verified Proof-of-Action MVP

**VeriAct** is an AI-verified proof-of-action protocol on Creditcoin. This repo contains a **2-hour hackathon MVP** that demonstrates a single happy-path flow: create a task → browse → submit proof → AI verify → reward released (mock settlement).

## What this MVP does

- **Sponsors** create a task (e.g. “Verify that a specific EV charger is operational at a given location”).
- **Participants** accept the task, upload proof (photo), optional note and manual lat/lng.
- **Backend** extracts EXIF when present, runs verification (OpenAI Vision if `OPENAI_API_KEY` is set, else mock), computes a score from visual + location + timestamp + anti-fraud.
- If **score ≥ threshold**, the submission is marked verified and a **mock reward payout** is shown (mock tx hash). No real blockchain in this MVP.

## Demo flow

1. **Create Task** — `/tasks/create` — Fill form (default: EV Charger #21), submit → redirects to task list.
2. **Explore Tasks** — `/tasks` — See open tasks (seed task is auto-created if none exist).
3. **Task Detail** — `/tasks/[id]` — View full task, upload image (+ optional note, manual lat/lng).
4. **Submit Proof** — Click “Submit proof” → API runs verification and settlement in one request.
5. **Verification Result** — `/submissions/[id]` — Pipeline steps, score breakdown, Verified/Rejected, reward released, mock tx hash.

## How to run

From the **monorepo root** (recommended):

```bash
pnpm install
pnpm dev:web
```

Or from `apps/web` only (standalone MVP without other packages):

1. In `apps/web/package.json`, remove the line `"@verifi/shared": "workspace:*"` from dependencies (VeriAct MVP does not use it).
2. Run:

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No external API or database required; everything uses in-memory store + Next.js API routes.

## Env vars

| Variable           | Required | Description |
|--------------------|----------|-------------|
| `OPENAI_API_KEY`   | No       | If set, verification uses OpenAI Vision for the “visual” part. If missing, a **mock verifier** is used (deterministic-style scores so the app still works). |

No other env vars are required for the MVP.

## Mock verification

- **Score formula:**  
  `score = 0.45×visual + 0.25×location + 0.15×timestamp + 0.15×antiFraud`
- **Visual:** With `OPENAI_API_KEY`: image sent to GPT-4o with a prompt asking if the image contains the expected object (e.g. EV charger); returns confidence. Without key: mock returns a plausible score based on task expected object.
- **Location:** Haversine distance from submitted coords (EXIF or manual) to task’s target lat/lng; score decays with distance.
- **Timestamp:** EXIF date/time vs “now”; recent = higher score.
- **Anti-fraud:** Placeholder based on presence of EXIF and file size.
- If **score ≥ task threshold** → status `VERIFIED`, then mock settlement runs and status becomes `PAID` with a mock `txHash`.

## Mock settlement

- `lib/mockChain.ts` exports `releaseReward(taskId, submissionId, rewardAmount)` and returns `{ success: true, txHash: "0x..." }`.
- `lib/contractService.ts` calls this; you can later replace the implementation with real Creditcoin / EVM integration.

## Where to plug in real Creditcoin

**Creditcoin testnet integration is included.** You can lock rewards on-chain when creating a task and release them when AI verification succeeds.

### 1. Install dependencies

```bash
# Contracts
cd packages/contracts
npm install

# Web (if not already)
cd ../../apps/web
npm install
```

### 2. Compile and deploy VeriActEscrow

```bash
cd packages/contracts
# Set in .env: PRIVATE_KEY, VERIFIER_ADDRESS (or DEPLOYER_ADDRESS)
npm run compile
npm run deploy:veriact
```

Copy the printed `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS` into `apps/web/.env.local`.

### 3. Configure apps/web .env.local

```env
NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS=0x...   # from deploy
NEXT_PUBLIC_CREDITCOIN_RPC=https://rpc.testnet.creditcoin.network
VERIFIER_PRIVATE_KEY=0x...   # private key of verifier (can be same as deployer for hackathon)
```

### 4. Run the Next.js app

```bash
cd apps/web
npm run dev
```

### 5. Connect MetaMask to Creditcoin testnet

- Network name: Creditcoin Testnet  
- RPC: `https://rpc.testnet.creditcoin.network`  
- Chain ID: 102031  
- Currency: CTC  

The app will prompt to add the network if needed.

### MVP flow with on-chain escrow

1. **Create Task** — Sponsor connects wallet, enters reward (e.g. 5 CTC). Clicks Create → reward is escrowed on Creditcoin testnet (`createTask()` payable), then task is saved with `onchainTaskId` and `escrowTxHash`. UI shows “Reward escrowed on Creditcoin testnet”.
2. **Explore Tasks** — Same as before; tasks with `onchainTaskId` are on-chain.
3. **Task Detail** — Participant uploads proof. Optional: click “Use my wallet for reward” to set the address that will receive the payout.
4. **Submit Proof** — AI verification runs. If score ≥ threshold and task has `onchainTaskId` and submission has `participantAddress`, the backend (verifier key) calls `verifyTask(onchainTaskId, worker)` and the reward is sent on-chain. Otherwise mock settlement is used.
5. **Verification Result** — Shows “Reward released” and the real transaction hash when on-chain payout succeeded.

---

## Legacy / mock-only

- **Contract layer:** Replace the implementation in `lib/contractService.ts` (and optionally keep `lib/mockChain.ts` for tests).
- **Tasks / submissions:** Today they live in `lib/store.ts` (in-memory). For production, swap to Supabase, Prisma, or your DB and keep the same shapes in `types/veriact.ts`.
- **Storage:** Proof images are currently sent as base64 in the API and stored in memory. For scale, upload to Supabase Storage or S3 and store URLs.

## Future improvements

- Real Creditcoin smart contracts and wallet integration.
- Stronger fraud detection and reputation.
- Richer evidence types (e.g. video, multiple photos).
- Full auth and multi-role permissions.
- Dispute flow and on-chain arbitration.

## Tech stack (MVP)

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Framer Motion, lucide-react, clsx
- React Query (TanStack Query), Zustand not used (React state + API)
- No Supabase in MVP; in-memory store only

## File structure (VeriAct MVP)

- `app/` — Routes: `/`, `/tasks`, `/tasks/create`, `/tasks/[id]`, `/submissions/[id]`
- `app/api/` — `tasks`, `tasks/[id]`, `submissions`, `submissions/[id]`, `dashboard`
- `components/veriact/` — Navbar, HeroSection, FeatureCards, HowItWorks, TaskCard, TaskForm, ProofUploadCard, VerificationStepper, ScoreBreakdown, SettlementCard, StatusBadge, EmptyState, DashboardStats
- `lib/` — store, mockChain, contractService, verifier, exif, veriact-api
- `types/veriact.ts` — Task, Submission, ScoreBreakdown, etc.
