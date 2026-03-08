"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlusCircle, User, Camera, Cpu, Coins, ArrowDown } from "lucide-react";

const steps = [
  { icon: PlusCircle, label: "Sponsor creates task", href: "/tasks/create" },
  { icon: User, label: "Participant performs action", href: "/tasks" },
  { icon: Camera, label: "Proof submitted", href: "/tasks" },
  { icon: Cpu, label: "AI verifies", href: null },
  { icon: Coins, label: "Reward released", href: "/dashboard" },
];

const spring = { type: "spring", stiffness: 300, damping: 26 };

export function DemoWalkthroughSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
      className="px-4 py-16 md:py-24 max-w-6xl mx-auto border-t border-zinc-800/80"
    >
      <motion.h2
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-2xl md:text-3xl font-bold text-center mb-2"
        style={{ color: "#f4f4f5" }}
      >
        Demo walkthrough
      </motion.h2>
      <motion.p
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-center text-muted-foreground max-w-xl mx-auto mb-12"
      >
        Log in with your wallet, then follow the flow from task creation to reward.
      </motion.p>
      <div className="max-w-sm mx-auto space-y-0">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
            transition={spring}
            className="flex flex-col items-center"
          >
            {step.href ? (
              <Link
                href={step.href}
                className="rounded-xl border border-zinc-700/80 flex items-center gap-4 p-4 w-full bg-zinc-900/50 hover:border-emerald-500/40 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30">
                  <step.icon className="h-5 w-5 text-emerald-400" aria-hidden />
                </div>
                <span className="font-medium text-foreground">{step.label}</span>
              </Link>
            ) : (
              <div className="rounded-xl border border-zinc-700/80 flex items-center gap-4 p-4 w-full bg-zinc-900/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-emerald-400" aria-hidden />
                </div>
                <span className="font-medium text-foreground">{step.label}</span>
              </div>
            )}
            {i < steps.length - 1 && (
              <ArrowDown className="h-5 w-5 text-zinc-500 my-1" aria-hidden />
            )}
          </motion.div>
        ))}
      </div>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-center mt-10"
      >
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 text-emerald-400 px-5 py-2.5 font-medium text-sm hover:bg-emerald-500/30 transition-colors"
        >
          See step-by-step flow
        </Link>
      </motion.div>
    </motion.section>
  );
}
