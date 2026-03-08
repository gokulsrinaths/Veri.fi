<p align="center">
  <img src="assets/verifi-logo.png" alt="veri.fi" width="280" />
</p>

<p align="center">
  <strong>Turn real-world activity into programmable proof.</strong>
</p>
<p align="center">
  We verify that people actually did the thing — then pay them on-chain.<br />
  <em>No trust. No manual checks.</em>
</p>
<p align="center">
  <sub>Built for <strong>BUIDL CTC Hackathon</strong> — Build for the Real World</sub>
</p>

---

## ✨ What it is

**veri.fi** connects real-world proof to on-chain rewards. Sponsors create tasks and lock rewards (CTC) on Creditcoin. Participants submit photo proof. Our backend scores each submission with a weighted model — visual (AI), location, timestamp, anti-fraud — and when the score clears the threshold, the smart contract releases the reward. Task closes. Done.

```
Prove it  →  We verify it  →  You get paid.
```

---

## 🚀 Quick start

```bash
git clone https://github.com/gokulsrinaths/Veri.fi.git
cd Veri.fi
pnpm install
pnpm dev:web
```

Open **http://localhost:3000**. Connect a wallet (MetaMask), create or explore tasks, upload proof, get verified.

| Optional | Action |
|----------|--------|
| Persistence | Copy `apps/web/.env.example` → `apps/web/.env.local` and add Supabase URL + keys |
| AI vision | Set `DEEPINFRA_API_KEY` or `OPENAI_API_KEY` for real image checks (otherwise fallback scoring) |
| On-chain | Deploy VeriActEscrow and set contract address + `VERIFIER_PRIVATE_KEY` (see below) |

---

## 🔄 How it works

| Step | What happens |
|------|----------------|
| **1. Create task** | Name, reward (e.g. 5 CTC), location type (online or physical with lat/long), threshold. Optionally escrow on Creditcoin testnet. |
| **2. Submit proof** | Photo + optional GPS. Backend extracts EXIF, runs vision (DeepInfra/OpenAI or fallback), and scores. |
| **3. Verify** | Weighted score: 0.45 visual + 0.25 location + 0.15 timestamp + 0.15 anti-fraud. Pass = verified. |
| **4. Settle** | Backend calls escrow `verifyTask(taskId, worker)`; reward goes to the participant; task is closed. |

---

## 🛠 Tech

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion
- **Backend:** Next.js API routes, optional Supabase (tasks, submissions, proof images)
- **Chain:** Creditcoin testnet — VeriActEscrow (Solidity) for escrow and payout
- **Verification:** EXIF, DeepInfra / OpenAI vision (or fallback), haversine location, weighted scoring

Monorepo: `apps/web` (main app), `packages/contracts` (Solidity).

---

## 🌐 Deploy frontend (Vercel)

1. Push the repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New** → **Project** → import repo.
3. Set **Root Directory** to **`apps/web`**.
4. (Optional) Add env vars: `NEXT_PUBLIC_CREDITCOIN_RPC`, `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS`, etc. — see [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md).
5. Deploy. Use the generated URL as your live demo link.

CLI: from repo root run `pnpm run deploy:vercel` (or `cd apps/web && vercel deploy`).

---

## ⛓ Deploy to Creditcoin testnet

To run with real on-chain escrow:

```bash
cd packages/contracts
cp .env.example .env
# Set PRIVATE_KEY, VERIFIER_ADDRESS in .env
pnpm install && pnpm run compile && pnpm run deploy:veriact
```

Then in `apps/web/.env.local`:

- `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS` = printed contract address  
- `NEXT_PUBLIC_CREDITCOIN_RPC` = `https://rpc.testnet.creditcoin.network`  
- `VERIFIER_PRIVATE_KEY` = verifier wallet private key (for backend payout)

Restart with `pnpm dev:web`. Create a task with a reward; it escrows on testnet and pays out on verification.

---

## 🏆 Hackathon fit

| Track | How veri.fi fits |
|-------|------------------|
| **DePIN** | Verify physical infrastructure — EV chargers, nodes, sensors, coverage. |
| **RWA** | Attest real-world state — inspections, logistics, asset condition. |
| **DeFi** | Escrow and settlement on Creditcoin; transparent, programmable payouts. |

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `pnpm dev:web` | Run web app (localhost:3000) |
| `pnpm build:web` | Build web app |
| `pnpm dev:api` | Run Fastify API (localhost:3001) |
| `pnpm contracts:deploy` | Deploy VeriActEscrow to Creditcoin testnet |
| `pnpm run deploy:vercel` | Deploy frontend via Vercel CLI |

---

## 📄 Docs

| File | Purpose |
|------|---------|
| [COMPLETION-CHECKLIST.md](./COMPLETION-CHECKLIST.md) | Deploy steps and verification before submission |
| [PROJECT-DESCRIPTION.md](./PROJECT-DESCRIPTION.md) | Long-form YC-style project description |
| [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) | Vercel settings and troubleshooting |
| [CREDITCOIN-TESTNET-AUDIT.md](./CREDITCOIN-TESTNET-AUDIT.md) | Testnet config audit and deploy details |

---

<p align="center">
  <strong>veri.fi</strong> — Prove it. Get paid.
</p>
