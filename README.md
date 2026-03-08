# veri.fi

> **Turn real-world activity into programmable proof.**

We verify that people actually did the thing — then pay them on-chain. No trust, no manual checks.

Built for **BUIDL CTC Hackathon** — Build for the Real World.

---

## What we built

Sponsors post tasks and lock rewards on Creditcoin. Participants submit photo proof. Our backend scores it (visual + location + time + anti-fraud). If the score clears the threshold, the smart contract releases the reward. Task closes. Done.

**One sentence:** Prove it → we verify it → you get paid.

---

## Try it

```bash
pnpm install
pnpm dev:web
```

Open **http://localhost:3000**. Connect a wallet, create or open a task, upload proof, get verified.

Optional: copy `apps/web/.env.example` → `apps/web/.env.local` and add Supabase / API keys for persistence and real verification. Without them, the app still runs (in-memory, fallback verifier).

---

## How it works

1. **Create task** — Name, reward (e.g. 5 CTC), location (or “online”), threshold. Optionally escrow on Creditcoin testnet.
2. **Submit proof** — Photo + optional GPS. Backend runs EXIF, vision (DeepInfra/OpenAI or fallback), and scoring.
3. **Verify** — Weighted score (e.g. 0.45 visual + 0.25 location + 0.15 timestamp + 0.15 anti-fraud). Pass = verified.
4. **Settle** — Backend calls escrow `verifyTask(taskId, worker)`; reward goes to the participant. Task is closed and drops off the list.

---

## Tech

Next.js 14 · TypeScript · Tailwind · Supabase (optional) · Creditcoin testnet (VeriActEscrow) · DeepInfra/OpenAI for vision

Monorepo: `apps/web` is the main app; `packages/contracts` for Solidity.

---

## Deploy on Vercel (frontend)

1. Push the repo to GitHub (if you haven’t).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Set **Root Directory** to `apps/web` (Edit → Root Directory → `apps/web`).
4. Add **Environment Variables** (Settings → Environment Variables) for production (and preview if you want):
   - `NEXT_PUBLIC_CREDITCOIN_RPC` = `https://rpc.testnet.creditcoin.network`
   - `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS` = your deployed contract address (optional; app works with fallback without it)
   - Optional: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DEEPINFRA_API_KEY` or `OPENAI_API_KEY`, `VERIFIER_PRIVATE_KEY` (only if you need server-side payout on Vercel).
5. **Deploy**. The repo’s `apps/web/vercel.json` uses a monorepo-friendly install (`pnpm install` from repo root) and `pnpm run build`.

Use the generated URL (e.g. `verifi.vercel.app`) as your **Live demo** link in HACKATHON-SUBMISSION.md.

**Using Vercel MCP:** If you use the Vercel MCP in Cursor and it tells you to run `vercel deploy`, run it from the **frontend** directory so the project root is correct: `cd apps/web && vercel deploy` (or from repo root: `pnpm run deploy:vercel`). Set **Root Directory** to `apps/web` in the Vercel dashboard if you linked from the repo root.

---

## Deploy to Creditcoin testnet

To run with real on-chain escrow:

1. `cd packages/contracts` → set `PRIVATE_KEY`, `VERIFIER_ADDRESS` in `.env` → `pnpm run compile && pnpm run deploy:veriact`
2. In `apps/web/.env.local`: `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS=<printed address>`, `NEXT_PUBLIC_CREDITCOIN_RPC=https://rpc.testnet.creditcoin.network`, `VERIFIER_PRIVATE_KEY=0x...`
3. `pnpm dev:web` — create a task with a reward; it escrows on testnet and pays out on verification.

---

## Hackathon fit

- **DePIN** — Verify physical infrastructure (e.g. EV chargers, sensors).
- **RWA** — Attest real-world state (e.g. store open, asset condition).
- **DeFi** — Escrow + settlement on Creditcoin.

---

## Commands

| Command | Description |
|--------|-------------|
| `pnpm dev:web` | Run web app (:3000) |
| `pnpm build:web` | Build web app |
| `pnpm dev:api` | Run Fastify API (:3001) |
| `pnpm contracts:deploy` | Deploy VeriActEscrow to Creditcoin testnet |
| `pnpm run deploy:vercel` | Deploy frontend via Vercel CLI (run from repo root; first time run from `apps/web`: `cd apps/web && vercel`) |

---

**Before submission:** See [COMPLETION-CHECKLIST.md](./COMPLETION-CHECKLIST.md) for deploy steps and verification.

**veri.fi** — Prove it. Get paid.
