# veri.fi refactor summary

## 1. Files changed

### New files
- `apps/web/components/veriact/ProblemSection.tsx` — Problem section (manual verification, fraud, trust, settlement)
- `apps/web/components/veriact/SolutionSection.tsx` — Solution section (evidence, AI verification, on-chain settlement)
- `apps/web/components/veriact/LandingArchitectureSection.tsx` — Architecture diagram (User → Evidence → AI → Creditcoin)
- `apps/web/components/veriact/HackathonAlignmentSection.tsx` — Hackathon tracks (DePIN, RWA, DeFi)
- `apps/web/components/veriact/WhyCreditcoinSection.tsx` — Why Creditcoin (escrow, transparency, trust, incentives)
- `apps/web/components/veriact/DemoWalkthroughSection.tsx` — Demo steps with links to Create task, Tasks, Dashboard
- `apps/web/app/protocol/page.tsx` — Protocol page (architecture, verification model, scoring, smart contract, use cases)
- `apps/web/app/how-it-works/page.tsx` — How it works page (visual step diagrams)
- `REFACTOR-SUMMARY.md` — This file

### Modified files
- `apps/web/components/veriact/index.ts` — Exported new section components
- `apps/web/app/page.tsx` — Landing now uses storytelling sections (Problem, Solution, Architecture, Hackathon, Why Creditcoin, Demo) and connect-wallet CTA
- `apps/web/components/veriact/Navbar.tsx` — Added nav links for Protocol and How it works

---

## 2. Backend architecture summary

All product logic lives in the backend; the frontend only calls APIs.

| Responsibility            | Location |
|---------------------------|----------|
| AI verification           | `lib/verifier.ts` — visual (DeepInfra/OpenAI or mock), location (haversine), timestamp, anti-fraud |
| Evidence scoring          | `lib/verifier.ts` — weights: visual 0.45, location 0.25, timestamp 0.15, anti-fraud 0.15 |
| EXIF metadata parsing     | `lib/exif.ts` — used in `POST /api/submissions` |
| Location validation       | `lib/verifier.ts` (distance from task target) |
| Fraud detection           | `lib/verifier.ts` (anti-fraud score; suspicious signals from vision) |
| Submission verification   | `app/api/submissions/route.ts` — calls `runVerification()` after creating submission |
| Settlement triggers       | `app/api/submissions/route.ts` — calls `settleReward()` when verified |
| Smart contract interaction| `lib/contractService.ts` → `lib/creditcoin-release-server.ts` (VeriActEscrow `verifyTask`) |
| Reward escrow             | Creditcoin testnet via VeriActEscrow; mock fallback in `lib/mockChain.ts` |

Frontend does not perform EXIF parsing, AI calls, or blockchain writes.

---

## 3. Frontend page structure

| Route              | Purpose |
|--------------------|---------|
| `/`                | Landing: Hero, Problem, Solution, Architecture, Hackathon alignment, Why Creditcoin, Demo walkthrough, Connect wallet |
| `/protocol`        | Protocol: architecture, verification model, scoring, smart contract design, use cases (DePIN, RWA, DeFi) |
| `/how-it-works`    | Visual step flow: Task creation → Evidence submission → Verification → Settlement |
| `/tasks`           | Explore tasks (unchanged) |
| `/tasks/create`    | Create task (unchanged) |
| `/tasks/[id]`      | Task detail + proof upload (unchanged) |
| `/dashboard`       | Dashboard (unchanged) |
| `/submissions/[id]`| Submission result (unchanged) |
| `/demo`            | Demo (unchanged) |

Demo flow: **Landing → Explore tasks → Submit proof → Verification (in API) → Reward** (and Create task / Dashboard as in Navbar).

---

## 4. API endpoints

| Method | Endpoint               | Purpose |
|--------|------------------------|---------|
| GET    | `/api/tasks`           | List tasks (query: status) |
| POST   | `/api/tasks`           | Create task |
| GET    | `/api/tasks/[id]`      | Get task by id |
| POST   | `/api/submissions`     | Create submission (upload proof); backend runs EXIF, verification, and settlement |
| GET    | `/api/submissions/[id]`| Get submission (and task) |
| GET    | `/api/dashboard`       | Dashboard stats |

Verification is executed inside **POST /api/submissions** (no separate `POST /api/verify`). When the client submits proof, the server:

1. Parses EXIF and optional manual location  
2. Runs `runVerification()` (visual, location, timestamp, anti-fraud)  
3. Updates submission status (VERIFIED / REJECTED)  
4. If verified, calls `settleReward()` (on-chain or mock)  
5. Returns the updated submission and task  
