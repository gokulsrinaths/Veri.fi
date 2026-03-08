# Veri.fi — Full Product Audit Report

**Auditor lens:** Senior Product Designer / UX Auditor (YC-style product review)  
**Scope:** Usability, runnability, UX polish, first-time clarity, hackathon demo readiness  
**Date:** March 2025

---

## PRODUCT OVERVIEW

### What the product does

**Veri.fi** is an AI-verified proof-of-action system on Creditcoin. In plain terms:

- **Sponsors** create verification tasks (e.g. "Verify EV Charger #21 at Palo Alto") and can escrow a reward (CTC) on Creditcoin testnet.
- **Participants** pick a task, upload a photo (with optional GPS/location), and submit proof.
- The **backend** runs a weighted verification score: visual (AI vision or mock), location, timestamp, anti-fraud. If the score meets the task's threshold, the submission is "verified."
- When verified, the **reward** is released: either on-chain (Creditcoin) via a verifier wallet or as a mock settlement for demo.

So: **real-world action → photo proof → AI + rules verify → reward released.** That's the core loop.

### Who the target user is

- **Sponsors:** People or projects that want to incentivize and verify real-world actions (e.g. DePIN operators, RWA attestations).
- **Participants:** People who complete tasks and earn rewards (e.g. "proof this EV charger exists and works").
- **Hackathon judges / investors:** As secondary audience, they need to understand the value in <30 seconds.

### Main workflow

1. **Land** on home → see value prop, "Create Task" and "Explore Tasks."
2. **Connect wallet** (MetaMask) — required to view tasks, create tasks, and dashboard.
3. **Explore tasks** → list of open tasks → click a task → task detail.
4. **Submit proof** on task detail: upload image, optional note, optional lat/lng, optional "Use my wallet for reward" → submit.
5. **Verification** runs (loading stepper) → redirect to **submission result** (score, breakdown, verified/rejected, settlement).
6. **Dashboard** shows aggregate stats and recent activity (when wallet connected).

### Core value proposition

**"Turn real-world activity into programmable proof."** This is clear on the landing page and in the "How it works" section. The three feature cards (Proof Submission, AI Verification, On-Chain Settlement) support it. No major clarity gap here — the value prop is understandable.

---

## RUNNABILITY CHECK (CRITICAL)

### What was verified

- **Codebase:** No broken imports or missing files in the web app. Next.js app uses internal API routes (`/api/*`) and **in-memory store** (`lib/store.ts`); no dependency on the separate Fastify API or PostgreSQL for the main web flow.
- **Environment:** `apps/web/.env.example` documents:
  - `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS`, `VERIFIER_PRIVATE_KEY` — optional (mock settlement if unset).
  - `DEEPINFRA_API_KEY` / `OPENAI_API_KEY` — optional (mock verifier if unset).
  - `NEXT_PUBLIC_CREDITCOIN_RPC` — has default (testnet).
- **Wallet:** MetaMask (or any `window.ethereum`) required; no wallet = connect flow blocks task creation and explore.
- **Build:** `pnpm` was not available in the audit environment; runnability is inferred from dependency list and code. No obvious circular deps or invalid imports in the web app.

### What will break or confuse if someone tries to run

| Risk | Impact | Mitigation |
|------|--------|------------|
| No `.env` or `.env.local` | App runs; create task works without escrow; settlement is mock. If they set `NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS` but not `VERIFIER_PRIVATE_KEY`, real payout path is incomplete. | Copy `.env.example` to `.env.local`; document "web-only run" in README. |
| MetaMask not installed | Connect fails; user stuck on "Connect MetaMask to view tasks." | Clear error message (e.g. "Install MetaMask"); already partially present. |
| Wrong network | User on mainnet; app expects Creditcoin testnet (chainId 102031). | `ensureCreditcoinNetwork()` prompts switch; good. |
| Server restart | In-memory store clears; tasks and submissions disappear. | Document; optional: add SQLite or use API for persistence. |
| `pnpm` not installed | `pnpm install` / `pnpm dev:web` fail. | README says Node 18+ and pnpm 9; no npm/yarn script parity noted. |

### RUNNABILITY SCORE: **7 / 10**

- **Runs** without DB or external API for the main web flow.
- **Docked** for: dependency on MetaMask, env copy not automatic, in-memory data loss on restart, and README describing a larger stack (Fastify, DB, demo mode) that doesn't match the current web-only, file-upload flow.

---

## UX / PRODUCT DESIGN AUDIT

### 1. Onboarding clarity

- **Problem:** No product tour or first-time tooltips. New user lands and must infer "connect wallet first" from copy and gates.
- **Why it hurts:** Slight friction; not blocking because gates are clear ("Connect MetaMask to view tasks").
- **Fix:** Optional 1–2 step tooltip on first visit: "Connect your wallet to explore or create tasks." Low priority for hackathon.

### 2. Navigation structure

- **Problem:** "Demo" flow (`/demo`) exists and is useful for judges but **has no link in the main nav**. Only way to find it is URL or README.
- **Why it hurts:** Judges may miss the one-click "Open seed task" path.
- **Fix:** Add "Demo" to the navbar or a prominent "Try demo" on the landing page.

### 3. UI hierarchy

- **Problem:** Generally good (cards, headings, sections). Some pages use a single "Loading..." line for initial fetch (task detail, submission result) with no skeleton or structure.
- **Why it hurts:** Feels unfinished; no sense of what's coming.
- **Fix:** Use a small skeleton or "Loading task…" / "Loading result…" with a spinner or stepper placeholder.

### 4. Button clarity

- **Problem:** CTAs are clear (Create Task, Explore Tasks, Submit proof, Connect Wallet). "Use my wallet for reward" in ProofUploadCard is secondary; some users may not realize they can receive on-chain reward there.
- **Why it hurts:** Minor — optional field is discoverable on scroll.
- **Fix:** One short line above the button: "Add your wallet address to receive CTC on Creditcoin testnet."

### 5. Error states

- **Problem:** Form errors (TaskForm, ProofUploadCard) show `Alert` with message. API errors surface as thrown message. ErrorBoundary catches React errors with a generic "Something went wrong" and "Try again."
- **Why it hurts:** Good coverage; submission result page does **not** handle API error (e.g. 404). If submission ID is invalid or data was lost (restart), the page stays in loading state.
- **Fix:** In submission result page: handle `isError` from `useQuery` and show "Submission not found or expired" with a link back to tasks.

### 6. Loading states

- **Problem:** Verification step has a stepper; dashboard has a skeleton. Task list has "Loading tasks...". Task detail and submission result use plain "Loading..." only.
- **Why it hurts:** Inconsistent polish; submission/task detail feel bare.
- **Fix:** Reuse a minimal skeleton or structured loading block for task and submission detail.

### 7. Feedback after user actions

- **Problem:** Create task → toast + redirect to list. Submit proof → stepper then redirect to result. Connect wallet (CreditcoinWallet) → stays on page and content appears. Good.
- **Fix:** Dashboard still says "You will be taken to your dashboard after connecting" but CreditcoinWallet no longer redirects — **update or remove that line** on the dashboard connect card.

### 8. Accessibility

- **Problem:** Skip link present; some buttons have `aria-label`; file input has `aria-describedby`. Focus styles exist. Not fully audited (no axe run).
- **Why it hurts:** Baseline is reasonable; could be improved (e.g. more consistent focus, live region for toasts).
- **Fix:** Ensure ToastProvider announces to screen readers; keep min touch targets (e.g. nav already uses min-h/min-w 44px).

### 9. Mobile responsiveness

- **Problem:** Layout uses Tailwind responsive classes (e.g. `md:flex`, `max-w-*`); nav becomes a sheet on small screens. Forms stack.
- **Why it hurts:** No obvious layout breaks; adequate for demo.
- **Fix:** Quick pass on a small viewport for overflow and tap targets.

### 10. Consistency across screens

- **Problem:** Dark theme and emerald accent are consistent. Mix of inline styles (hero) and Tailwind elsewhere. Home "Connect Wallet" (HomeConnectWallet) still redirects to dashboard; in-app "Connect Wallet" (CreditcoinWallet) does not — intentional but could be documented.
- **Why it hurts:** Small inconsistency in copy (dashboard "taken to dashboard" vs actual behavior).
- **Fix:** Align copy with behavior; optionally add a one-line comment in code for future maintainers.

---

## CORE USER FLOW ANALYSIS

| Step | Obvious? | Self-explanatory? | What could confuse |
|------|----------|-------------------|--------------------|
| 1. Landing | Yes | Headline + two CTAs | "Go to dashboard" link when not connected leads to connect gate — fine but slightly redundant. |
| 2. Connect wallet | Yes | Gates say "Connect MetaMask to view tasks / create task." | User without MetaMask gets generic error; "Install MetaMask" could be more prominent. |
| 3. Create task | Yes | Form with prefilled demo values; reward, location, object. | If escrow env is set but deploy missing, createTaskOnChain can throw — error is shown. |
| 4. Explore tasks | Yes | List → click card → task detail. | Empty state is clear ("Create task" CTA). Seed task is created on first getTasks. |
| 5. Submit proof | Yes | Upload, optional note/location/wallet; "Submit proof" CTA. | "Use my wallet for reward" is easy to miss; no camera capture (README mentioned in-app camera — current flow is file upload). |
| 6. Verification | Yes | Stepper + "Verifying your proof…" then redirect. | None. |
| 7. Result | Yes | Score, breakdown, verified/rejected, settlement card. | If submission 404 (e.g. after restart), page shows loading forever — needs error state. |
| 8. Dashboard | Yes | Stats + recent activity. | Recent activity items don't link to submission detail; could add "View" link. |

---

## HACKATHON DEMO READINESS

- **Story:** "Proof of real-world action, verified by AI, paid on Creditcoin" — clear and scoped.
- **30-second explain:** Yes — "Create a task, someone uploads a photo, AI verifies it, they get paid on-chain (or mock)."
- **UI:** Cohesive dark theme, motion, cards, clear hierarchy. Not flashy but professional.
- **Demo risks:**
  - MetaMask not installed or wrong network.
  - Empty task list if store wasn't seeded (seed runs on first GET /api/tasks — should be fine).
  - Verification rejects (e.g. low visual score) — acceptable if threshold is explained.
  - Judges go to "Explore Tasks" without connecting and see connect gate — good; then they might not find "Demo" for the one-click seed task.

### DEMO READINESS SCORE: **6.5 / 10**

- **Strengths:** End-to-end flow works; value prop clear; verification and settlement feel real (mock or on-chain).
- **Gaps:** Demo entry point hidden; loading/error handling on key pages; runnability and "web-only" path under-documented.

---

## PRODUCT DESIGN QUALITY SCORES

| Dimension | Score (0–10) | Note |
|-----------|--------------|------|
| **UX Design** | 7 | Clear hierarchy and flows; loading and error states need tightening. |
| **Technical Structure** | 7 | Next.js + API routes + store is clean; in-memory only limits persistence. |
| **Clarity of Value** | 8 | Landing and "How it works" make the proposition clear. |
| **Demo Quality** | 6 | Story and flow are good; demo discoverability and env/data risks. |
| **Innovation** | 7 | AI + chain + proof-of-action is a known combo but well executed. |
| **Execution** | 7 | Core path works; details (copy, 404 handling, demo link) need a pass. |

---

## CRITICAL FIX LIST (TOP 10)

Focus: **usability, reliability, clarity, demo stability.**

1. **Submission result 404 handling**  
   When `submissionsApi.get(id)` returns 404, show "Submission not found or expired" and a link to Explore Tasks instead of endless "Loading...".

2. **Dashboard connect copy**  
   Remove or change "You will be taken to your dashboard after connecting" so it matches behavior (no redirect after connect).

3. **Demo discoverability**  
   Add "Demo" to the main nav or a clear "Try demo" / "Open seed task" button on the landing page so judges can one-click into the flow.

4. **Task detail loading**  
   Replace plain "Loading..." with a short skeleton or "Loading task…" and spinner so the page doesn't feel empty.

5. **Submission result loading**  
   Same as above: skeleton or "Loading result…" instead of bare "Loading...".

6. **README runnability**  
   Add a "Web-only quick start" section: copy `apps/web/.env.example` to `.env.local`, `pnpm install`, `pnpm dev:web`, open localhost:3000. Clarify that the Fastify API and DB are optional for the main demo.

7. **Recent activity links**  
   In DashboardStats, make each recent activity row link to `/submissions/{id}` so users can open the submission from the dashboard.

8. **Optional: "Use my wallet" hint**  
   In ProofUploadCard, add one line above "Use my wallet for reward" explaining that the wallet is for receiving CTC on Creditcoin testnet.

9. **ErrorBoundary recovery**  
   "Try again" only clears error state; consider also scrolling to top or refocusing main content so keyboard/screen-reader users know where they are.

10. **Optional: persistence**  
    Document that data is in-memory and lost on restart; or add a minimal persistence layer (e.g. SQLite or use existing API) so demos survive refresh/restart.

---

## FINAL VERDICT

### **Needs minor fixes**

**Why not "Hackathon ready" yet**

- Submission 404 leaves the user on a permanent loading state.
- Stale dashboard copy and hidden demo path reduce clarity and demo impact.
- Loading states on task/submission detail feel unfinished.
- Runnability is good in code but not clearly documented for a "clone and run" judge experience.

**Why not "Major redesign" or "Execution weak"**

- Core value proposition is clear; the loop (create → submit → verify → reward) is implemented and understandable.
- Wallet gating, verification stepper, score breakdown, and settlement card are coherent and build trust.
- Technical structure is sound; gaps are mostly copy, error handling, and discoverability.

**Path to "Hackathon ready"**

- Implement fixes **1–7** (404 handling, dashboard copy, demo link, loading states, README, recent-activity links). That's roughly one focused pass (e.g. half a day).
- Optionally add **8–10** for extra polish and persistence.

---

*End of audit.*
