"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/veriact";
import {
  PlusCircle,
  Camera,
  Cpu,
  Coins,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";

const spring = { type: "spring" as const, stiffness: 300, damping: 26 };

const steps = [
  {
    icon: PlusCircle,
    title: "Task creation",
    desc: "Sponsor defines the task: name, description, expected object, location, reward amount, and threshold. Reward can be escrowed on Creditcoin.",
    href: "/tasks/create",
  },
  {
    icon: Camera,
    title: "Evidence submission",
    desc: "Participant uploads a photo (and optional note, manual lat/lng). Backend extracts EXIF when present and validates location.",
    href: "/tasks",
  },
  {
    icon: Cpu,
    title: "Verification",
    desc: "Server runs visual, location, timestamp, and anti-fraud scoring. If score ≥ threshold, submission is marked verified.",
    href: null,
  },
  {
    icon: Coins,
    title: "Settlement",
    desc: "When verified, the backend calls the escrow contract to release the reward to the participant.",
    href: "/dashboard",
  },
];

export default function HowItWorksPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0a0a0a", color: "#f4f4f5" }}
    >
      <Navbar />
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-10 md:py-16">
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">How it works</h1>
          <p className="text-muted-foreground mb-10">
            Visual step-by-step flow from task creation to reward.
          </p>
        </motion.div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={spring}
              className="flex flex-col items-center"
            >
              <div className="w-full">
                {step.href ? (
                  <Link
                    href={step.href}
                    className="rounded-xl border border-zinc-700/80 flex items-start gap-4 p-5 w-full bg-zinc-900/50 hover:border-emerald-500/40 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30">
                      <step.icon className="h-6 w-6 text-emerald-400" aria-hidden />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{step.title}</span>
                        <span className="text-xs text-emerald-400">Step {i + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-xl border border-zinc-700/80 flex items-start gap-4 p-5 w-full bg-zinc-900/50">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-emerald-400" aria-hidden />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{step.title}</span>
                        <span className="text-xs text-emerald-400">Step {i + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {i < steps.length - 1 && (
                <ArrowDown
                  className="h-6 w-6 text-zinc-500 my-2"
                  aria-hidden
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap gap-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 text-emerald-400 px-5 py-2.5 font-medium text-sm hover:bg-emerald-500/30 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            Try the demo
          </Link>
          <Link
            href="/protocol"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 text-foreground px-5 py-2.5 font-medium text-sm hover:bg-zinc-800 transition-colors"
          >
            Read the protocol
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
