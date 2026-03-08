# Veri.fi — Completion Checklist

Use this list to get the project fully ready for the hackathon and for Creditcoin testnet.

---

## Done (in codebase)

- Landing page with problem, solution, architecture, hackathon fit, why Creditcoin, demo walkthrough
- Create task (with optional on-chain escrow), explore tasks, task detail, proof upload, verification, submission result, dashboard
- Edit and remove task (sponsor only); sponsor wallet shown on each task
- Location type: online (no lat/long) vs physical (required lat/long); verification skips location score for online tasks
- Task closes and disappears from list after a verified submission is paid
- Wallet connect (MetaMask), Creditcoin testnet switch, add network if missing (chain 102031)
- Creditcoin testnet config: chainId 102031, RPC in env; VeriActEscrow ABI and flow in frontend and backend
- Settlement: backend calls verifyTask when verified; fallback when contract/env not set
- Supabase optional: schema, storage bucket, store layer; app works without it (in-memory)
- README (YC-style), PROJECT-DESCRIPTION (YC-style), HACKATHON-SUBMISSION (summary), CREDITCOIN-TESTNET-AUDIT (full audit), LaTeX Beamer pitch deck (verifi-pitch-deck.tex)
- No “mock”/“demo only” in user-facing copy; “Transaction” and “fallback” used instead

---

## You must do (to be 100% ready)

### 1. Deploy VeriActEscrow to Creditcoin testnet

Required for the hackathon rule: “deployed or interact with a blockchain testnet.”

1. `cd packages/contracts`
2. Copy `.env.example` to `.env`
3. Set in `.env`:
   - `PRIVATE_KEY` — deployer wallet (needs testnet CTC for gas)
   - `VERIFIER_ADDRESS` or `DEPLOYER_ADDRESS` — address that can call `verifyTask` (e.g. same as deployer)
   - Optionally `CREDITCOIN_RPC` if not using default
4. Run: `pnpm install && pnpm run compile && pnpm run deploy:veriact`
5. Copy the printed contract address

Full steps: see **CREDITCOIN-TESTNET-AUDIT.md** Section 9.

### 2. Configure web app for testnet

1. In `apps/web`, copy `.env.example` to `.env.local` if needed
2. Set:
   - `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS=<address from step 1>`
   - `NEXT_PUBLIC_CREDITCOIN_RPC=https://rpc.testnet.creditcoin.network` (or official Creditcoin testnet RPC)
   - `VERIFIER_PRIVATE_KEY=0x...` — private key of the verifier address (for backend to call `verifyTask`)
3. Restart: `pnpm dev:web` (or `pnpm dev` from root)

### 3. Optional: Supabase for persistence

- Create a Supabase project, run `supabase/schema.sql` in SQL Editor, create `proof-images` bucket if needed
- Set in `apps/web/.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- See **SETUP-SUPABASE.md**

### 4. Optional: AI verification

- Set `DEEPINFRA_API_KEY` or `OPENAI_API_KEY` in `apps/web/.env.local` for real vision checks; otherwise fallback verifier is used

### 5. Hackathon submission

- Fill in **HACKATHON-SUBMISSION.md** or the form: repo URL, live demo URL (e.g. your Vercel URL), video/pitch link if required, team name/members
- Use **PROJECT-DESCRIPTION.md** for long-form pitch; **verifi-pitch-deck.tex** for slides (e.g. Overleaf)

### 6. Deploy frontend on Vercel (optional)

- Push repo to GitHub → [vercel.com](https://vercel.com) → Import repo → set **Root Directory** to `apps/web` → add env vars (see README “Deploy on Vercel”) → Deploy. Use the Vercel URL as your live demo link.

---

## Quick reference

| Doc | Purpose |
|-----|--------|
| README.md | Quick start, what we built, how it works, deploy to testnet |
| PROJECT-DESCRIPTION.md | YC-style long description |
| HACKATHON-SUBMISSION.md | Short summary for submission |
| CREDITCOIN-TESTNET-AUDIT.md | Testnet config audit + deploy steps |
| verifi-pitch-deck.tex | LaTeX Beamer pitch deck |
| SETUP-SUPABASE.md | Supabase setup |
| apps/web/vercel.json | Vercel monorepo config (root dir = apps/web) |

---

## Verify before submission

- [ ] Contract deployed; address in `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS`
- [ ] `VERIFIER_PRIVATE_KEY` set so backend can call `verifyTask`
- [ ] Create task → reward escrowed on Creditcoin testnet
- [ ] Submit proof → verify → reward released; task closes
- [ ] README and submission doc have correct repo/demo links
- [ ] Pitch deck and project description updated if anything changed

Veri.fi — Prove it. Get paid.
