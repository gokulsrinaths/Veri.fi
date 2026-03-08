# Veri.fi — Project Description (YC Style)

## One-liner

Veri.fi turns real-world activity into programmable proof. We verify that people actually did the thing, then pay them on-chain. No trust, no manual checks.

---

## The problem

A huge amount of economically important activity happens in the physical world: someone checks an EV charger, confirms a delivery, audits a store, inspects a site, or shows up to an event. Today, verifying that any of this actually happened is manual, expensive, and slow. Companies hire auditors, send people into the field, or rely on self-reported forms and photos. That doesn’t scale, and it’s easy to game. There’s no open, programmable link between “I did the thing” and “I get paid.” Settlement is opaque, centralized, or both.

We’re building for a world where real-world proof and on-chain rewards are connected by default. The bottleneck isn’t blockchain; it’s verification. Veri.fi fixes that.

---

## What we built

Veri.fi is an AI-verified proof-of-action protocol on Creditcoin. Sponsors create tasks and lock rewards (CTC) on-chain. Participants perform the task in the real world and submit evidence—photos, optional GPS, metadata. Our backend scores each submission using a weighted model: visual check (AI), location, timestamp, and anti-fraud signals. If the score meets the task’s threshold, the smart contract releases the reward to the participant. The task closes and drops off the list. End to end: prove it, we verify it, you get paid.

We’re not replacing the human in the loop; we’re replacing the manual, trust-heavy verification layer with a transparent, programmable one. Creditcoin handles escrow and settlement. We handle the bridge between “evidence” and “verified.”

---

## How it works

A sponsor defines a task (e.g. “Verify EV charger #21 is operational at this location”), sets a reward and a confidence threshold, and optionally escrows the reward on Creditcoin testnet. A participant finds the task, does the thing, and uploads proof—typically a photo, with optional manual lat/long if the image has no EXIF. Our backend extracts metadata, runs a vision check (DeepInfra or OpenAI when configured, fallback otherwise), computes location and recency, and combines everything into a single score. If the score is at or above the threshold, we call the VeriActEscrow contract to release the reward to the participant’s wallet. The task is marked closed and no longer appears in the open task list. All of this is visible: task, evidence, score, and payout.

We support both “physical” tasks (with required lat/long and location scoring) and “online” tasks (no location check). That lets the same stack power infrastructure checks, delivery confirmation, retail audits, and purely digital proof.

---

## Why Creditcoin

We need escrow and settlement that are transparent and programmable. Creditcoin gives us that: rewards sit on-chain until verification passes, then the verifier backend triggers the release. No single party holds the keys to both “did they pass?” and “do they get paid?” The contract does. That’s the right primitive for proof-of-action at scale—auditable, composable, and aligned with real-world coordination rather than speculation.

---

## Hackathon fit: Build for the Real World

Veri.fi is built for the BUIDL CTC Hackathon—Build for the Real World. We’re not building another DeFi yield product; we’re building infrastructure for verifying real-world activity and settling rewards on-chain.

We touch three tracks directly. DePIN: verify physical infrastructure (EV chargers, nodes, sensors, coverage). RWA: attest real-world state—inspections, logistics events, asset condition. DeFi-adjacent settlement: escrow and automated reward release on Creditcoin, so proof and payout are on the same chain and in the same flow. The demo is one sponsor, one participant, one task, one proof, one payout. Judges can run it in minutes.

---

## Use cases

EV charger verification. Logistics and delivery confirmation. Retail and store audits. Field inspections and asset condition. Community and event data collection. Any setting where “someone did something in the real world” needs to be verified and optionally rewarded. We’re starting with photo + metadata and a clear scoring model; the same architecture can extend to more evidence types and richer AI as we go.

---

## Tech in one paragraph

Next.js 14 (App Router), TypeScript, Tailwind, Supabase for persistence and proof-image storage, Creditcoin testnet for escrow and payout. VeriActEscrow is a minimal Solidity contract: createTask (payable), verifyTask (verifier-only). The verification pipeline is server-side: EXIF, vision API or fallback, haversine for location, weighted score. No heavy logic in the browser. Run locally with pnpm install and pnpm dev:web; point the app at a deployed contract and verifier key for real on-chain settlement.

---

## Summary for judges

Veri.fi turns real-world activity into programmable proof. Sponsors create tasks and escrow rewards on Creditcoin; participants submit evidence; our backend verifies it; the smart contract pays out when the score clears the threshold. It’s built for the real world—DePIN, RWA, and on-chain settlement in one flow. Prove it. We verify it. You get paid.

Veri.fi — Turn real-world activity into programmable proof.
