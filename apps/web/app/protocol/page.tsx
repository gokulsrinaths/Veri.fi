"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/veriact";
import {
  Layers,
  Cpu,
  BarChart3,
  FileCode2,
  Wifi,
  Building2,
  Coins,
  ArrowRight,
} from "lucide-react";

const spring = { type: "spring" as const, stiffness: 300, damping: 26 };

export default function ProtocolPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0a0a0a", color: "#f4f4f5" }}
    >
      <Navbar />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-emerald-400 mb-6 inline-block"
          >
            ← Back to home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Protocol</h1>
          <p className="text-muted-foreground mb-10">
            Architecture, verification model, scoring, and smart contract design.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="mb-12"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <Layers className="h-5 w-5 text-emerald-400" />
            Architecture
          </h2>
          <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              veri.fi runs verification and settlement in the backend. The frontend calls APIs
              (<code className="text-emerald-400/90">POST /api/tasks</code>,{" "}
              <code className="text-emerald-400/90">POST /api/submissions</code>) and never
              performs EXIF parsing, AI calls, or blockchain writes. All heavy logic lives
              server-side.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>Task creation and listing → API</li>
              <li>Evidence upload → API (EXIF + optional manual location)</li>
              <li>Verification scoring → API (visual, location, timestamp, anti-fraud)</li>
              <li>Settlement → API (Creditcoin escrow release or fallback)</li>
            </ul>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="mb-12"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <Cpu className="h-5 w-5 text-emerald-400" />
            Verification model
          </h2>
          <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Each submission is scored from 0–1. When the score meets or exceeds the task
              threshold, the submission is marked verified and the reward can be released.
            </p>
            <p className="text-sm text-muted-foreground">
              Visual check uses an AI vision model (e.g. Llama vision or OpenAI) to confirm
              the image contains the expected object. Location uses haversine distance from
              submitted coordinates to the task target. Timestamp and anti-fraud signals
              (EXIF presence, file size) complete the model.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="mb-12"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            Scoring system
          </h2>
          <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-6">
            <p className="text-muted-foreground mb-4">
              Final score is a weighted sum of four components:
            </p>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-foreground">Visual (expected object in image)</span>
                <span className="text-emerald-400 font-mono">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Location (distance to target)</span>
                <span className="text-emerald-400 font-mono">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Timestamp (recency)</span>
                <span className="text-emerald-400 font-mono">15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Anti-fraud (EXIF, file signals)</span>
                <span className="text-emerald-400 font-mono">15%</span>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="mb-12"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <FileCode2 className="h-5 w-5 text-emerald-400" />
            Smart contract design
          </h2>
          <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-6 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">VeriActEscrow</strong> on Creditcoin
              testnet holds rewards when a sponsor creates a task. The backend (verifier
              wallet) calls <code className="text-emerald-400/90">verifyTask(taskId, worker)</code> only
              after AI verification passes. That releases the reward to the participant
              address. If on-chain escrow is not configured, a fallback settlement is used.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
        >
          <h2 className="text-xl font-semibold mb-4">Use cases</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-700/80 p-5 bg-zinc-900/50">
              <Wifi className="h-8 w-8 mb-2 text-emerald-400" />
              <h3 className="font-medium text-foreground mb-1">DePIN</h3>
              <p className="text-sm text-muted-foreground">
                Verify infrastructure: EV chargers, telecom nodes, sensors. Proof of
                presence and operation.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-700/80 p-5 bg-zinc-900/50">
              <Building2 className="h-8 w-8 mb-2 text-emerald-400" />
              <h3 className="font-medium text-foreground mb-1">RWA</h3>
              <p className="text-sm text-muted-foreground">
                Validate physical assets: inspections, logistics events, condition
                checks.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-700/80 p-5 bg-zinc-900/50">
              <Coins className="h-8 w-8 mb-2 text-emerald-400" />
              <h3 className="font-medium text-foreground mb-1">DeFi settlement</h3>
              <p className="text-sm text-muted-foreground">
                Escrow and release rewards on Creditcoin when verification passes.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap gap-4"
        >
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 text-emerald-400 px-5 py-2.5 font-medium text-sm hover:bg-emerald-500/30 transition-colors"
          >
            How it works <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 text-foreground px-5 py-2.5 font-medium text-sm hover:bg-zinc-800 transition-colors"
          >
            Explore tasks
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
