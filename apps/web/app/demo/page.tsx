"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ListTodo } from "lucide-react";

const SEED_TASK_ID = "seed-ev-charger-21";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Veri<span className="text-emerald-400">Act</span>
        </Link>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Demo</span>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Zap className="w-7 h-7 text-emerald-400" />
            EV Charger verification demo
          </h1>
          <p className="text-white/60 text-sm">
            One flow: open the seed task, upload a photo (with optional manual lat/lng), get verified and see mock reward.
          </p>
        </motion.div>

        <ol className="list-decimal list-inside space-y-4 text-white/80 text-sm mb-8">
          <li>Go to Explore Tasks and open the seed task &quot;Verify EV Charger #21&quot;.</li>
          <li>Upload a photo (EV charger or any image for testing).</li>
          <li>Optionally enter manual latitude/longitude (e.g. 37.44, -122.14 for Palo Alto).</li>
          <li>Submit — backend runs verification (visual, location, timestamp, anti-fraud).</li>
          <li>If score ≥ threshold, reward is released; result page shows mock tx hash.</li>
        </ol>

        <Link
          href={`/tasks/${SEED_TASK_ID}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 text-black px-6 py-3 font-semibold hover:bg-emerald-400"
        >
          <ListTodo className="w-5 h-5" />
          Open seed task
        </Link>
      </main>
    </div>
  );
}
