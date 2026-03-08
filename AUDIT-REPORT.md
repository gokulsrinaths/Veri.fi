# Veri.fi — Codebase Audit Report

**Date:** Based on current repository state  
**Scope:** apps/web, packages/contracts, supabase schema, configs, docs

---

## 1. Executive summary

| Area | Status | Notes |
|------|--------|--------|
| **Security** | Good | No secrets in repo; server-side keys used correctly; RLS permissive by design for demo |
| **Deployment** | Addressed | Vercel config runs install/build from repo root; Root Directory = apps/web required |
| **API & data** | Good | Consistent error handling; store supports in-memory + Supabase; IDs as string (UUID compatible) |
| **Frontend** | Good | No XSS vectors; ErrorBoundary; skip link; env only NEXT_PUBLIC_* on client |
| **Blockchain** | Good | Creditcoin testnet (102031); ethers.isAddress used; fallback when contract/env missing |
| **Docs & config** | Good | README, .env.example, VERCEL-DEPLOY, COMPLETION-CHECKLIST, no .env committed |

**Risks / improvements:** Server-side file type and size validation on submissions; optional input length limits on task create; Supabase RLS is permissive (documented as demo choice).

---

## 2. Security

### 2.1 Secrets and environment

- **.gitignore** includes `.env`, `.env.local`, `.env*.local` — good.
- **No hardcoded secrets** in code; all sensitive values from `process.env`.
- **Client vs server:** Only `NEXT_PUBLIC_*` used in client code; `VERIFIER_PRIVATE_KEY`, `DEEPINFRA_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` used only in server/API — correct.
- **.env.example** (apps/web and packages/contracts) document required/optional vars without values.

### 2.2 API and input validation

- **Submissions POST:** Validates presence of `file` and `taskId`; task existence; participant address trimmed. **Gap:** No server-side check that `file` is an image type or under a max size (client has `accept="image/*"`; Supabase bucket allows 10MB and image MIME types). Recommendation: validate `file.type` against allowed image types and `file.size` (e.g. ≤ 10MB) before processing.
- **Tasks POST/PATCH:** Body cast to typed shape; numbers and optionals coerced (e.g. `threshold`, `targetLatitude`). **Gap:** No explicit max length on `name`, `description`, `expectedLocation`, `expectedObject` — very long strings could stress DB or storage. Optional improvement: add length limits (e.g. 500 chars) and return 400 if exceeded.
- **Creditcoin release API:** Validates `onchainTaskId` and `workerAddress`; uses `ethers.isAddress(workerAddress)`. Good.
- **Path params:** API routes use `params.id` (and in some files `await params` for Next 15–style Promise). No raw concatenation into SQL or storage paths — Supabase client handles parameterization.

### 2.3 XSS and injection

- **No `dangerouslySetInnerHTML` or `eval`** in apps/web.
- User-controlled content (task name, description, submission note) is rendered as text in React — safe.
- Supabase queries use client API (parameterized); no raw SQL in app code.

### 2.4 Authentication and authorization

- **Wallet-based identity:** Address from MetaMask; stored in context and localStorage for UX. Not used for access control to API routes — any client can call POST /tasks, POST /submissions.
- **Edit/delete task:** Frontend only: owner check `address.toLowerCase() === task.sponsorWallet.toLowerCase()`; API does not enforce “only sponsor can PATCH/DELETE”. So a user who knows a task ID could call PATCH/DELETE directly. For hackathon/demo this is acceptable; for production, API should verify wallet (e.g. signature or session) and sponsor ownership.
- **Settlement:** Backend holds `VERIFIER_PRIVATE_KEY` and calls `verifyTask`; only backend can release rewards — correct.

### 2.5 Supabase and RLS

- **RLS enabled** on `users`, `tasks`, `submissions`, `verification_results`.
- **Policies:** All “Allow all … USING (true)” — full read/write for service role and anon (documented as permissive for demo). For production, policies should be tightened (e.g. by wallet or role).
- **Storage:** `proof-images` bucket has public read; upload/update/delete require authenticated role. Service role can upload from API — correct.

---

## 3. Deployment (Vercel)

### 3.1 Current configuration

- **apps/web/vercel.json**
  - `installCommand`: `cd ../.. && pnpm install` (monorepo root)
  - `buildCommand`: `cd ../.. && pnpm run build:web`
  - `framework`: `nextjs`
- **Root Directory** must be **apps/web** in Vercel project settings so Next.js output (e.g. `apps/web/.next`) is used.
- **packageManager** in apps/web/package.json: `pnpm@9.0.0` — helps Vercel use pnpm.
- **engines:** `node`: `18.x` in root and apps/web — avoids “auto upgrade” warning and keeps runtime consistent.

### 3.2 Common failures and fixes

- **“No Next.js version detected” / “next: command not found”:** Caused by building from repo root without using the web app’s dependencies, or by Vercel using npm instead of vercel.json. Fix: Root Directory = `apps/web`; leave Install/Build commands empty so vercel.json is used, or set them explicitly to the `cd ../.. && pnpm …` commands (see VERCEL-DEPLOY.md).
- **“npm run build” in logs:** Dashboard override. Clear Build/Install overrides so vercel.json applies.

---

## 4. Code quality and consistency

### 4.1 Types and store

- **types/veriact.ts:** Task, Submission, ScoreBreakdown, enums — used consistently.
- **Store (lib/store.ts):** In-memory fallback when Supabase not configured; rowToTask/rowToSubmission map DB snake_case to app camelCase; IDs as string (Supabase UUIDs stringified). No type/ID mismatch found.
- **Location:** “Online” vs “physical” implied by `targetLatitude`/`targetLongitude` (null = online). Verifier gives full location score for online tasks — consistent.

### 4.2 API routes

- All handlers use try/catch and return `NextResponse.json(..., { status })` with 400/404/500 as appropriate.
- Error message: `e instanceof Error ? e.message : "..."` — no leaking of stack traces.
- No empty catch blocks.

### 4.3 Naming and cleanup

- “Mock” wording replaced with “fallback” in contractService, verifier, mockChain (file name kept for compatibility).
- No stray `console.log`/`console.debug`/`debugger`; one `console.warn` in contractService for fallback path — acceptable.

### 4.4 Frontend

- **ErrorBoundary** wraps app; shows message and “Try again”.
- **SkipLink** to `#main-content` with .skip-link styles (focus visible).
- **Images:** ProofUploadCard and camera preview use appropriate `alt` text.
- **Wallet:** WalletContext + CreditcoinWallet; optional CreditcoinCheck — no forced chain in code other than config.

---

## 5. Blockchain (Creditcoin testnet)

- **Chain ID:** 102031 in apps/web (creditcoin.ts, CreditcoinCheck.jsx) and packages/contracts (hardhat).
- **RPC:** From env; default `https://rpc.testnet.creditcoin.network`.
- **VeriActEscrow:** createTask (payable), verifyTask (verifier only); deploy script takes VERIFIER_ADDRESS.
- **Backend settlement:** releaseOnChain uses VERIFIER_PRIVATE_KEY; checks ethers.isAddress(workerAddress).
- **Fallback:** When contract or verifier key missing, contractService uses in-memory release (no on-chain tx); UI does not imply a real tx in that case.

---

## 6. Dependencies and build

- **Next.js 14.0.4;** React 18; TypeScript 5.3; Tailwind; ethers 6; Supabase client.
- **next.config.js:** reactStrictMode; serverComponentsExternalPackages: ["ethers"].
- **Monorepo:** pnpm workspace; apps/web, apps/api, packages/contracts, packages/shared. Vercel builds only web via `pnpm run build:web`.
- **No audit of npm advisories run** in this audit — recommend `pnpm audit` (or npm audit) periodically.

---

## 7. Documentation and repo hygiene

- **README.md:** Logo, quick start, how it works, tech, Vercel + Creditcoin deploy, commands, doc links.
- **VERCEL-DEPLOY.md:** Root Directory, Build/Install, troubleshooting.
- **COMPLETION-CHECKLIST.md:** What’s done and what to do before submission.
- **CREDITCOIN-TESTNET-AUDIT.md:** Chain/RPC/contract/env and deploy steps.
- **PROJECT-DESCRIPTION.md:** YC-style long description.
- **.env.example** present in apps/web and packages/contracts; no .env committed.

---

## 8. Recommendations (prioritized)

| Priority | Item | Action |
|----------|------|--------|
| High | Server-side submission file validation | In POST /api/submissions, reject if file.type not in allowed image types or file.size > 10MB. |
| Medium | Task input length limits | Optionally enforce max length on name/description/expectedLocation/expectedObject and return 400. |
| Medium | API auth for task update/delete | For production, require wallet signature or session and verify sponsor ownership before PATCH/DELETE task. |
| Low | Supabase RLS | Replace “Allow all” with wallet- or role-based policies when moving out of demo. |
| Low | Dependency audit | Run pnpm audit and address critical/high where feasible. |

---

## 9. Conclusion

The codebase is in good shape for a hackathon/demo: clear structure, no exposed secrets, consistent error handling, and deployment config that works when Vercel uses the repo-root install and build. The main improvements are server-side validation of submission files (type and size), optional input limits on task fields, and (for production) API-level auth and stricter RLS.

**veri.fi** — Prove it. Get paid.
