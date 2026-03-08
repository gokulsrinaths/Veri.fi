"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { User, Image, Cpu, Coins, ArrowDown } from "lucide-react";

const steps = [
  { icon: User, label: "User", desc: "Sponsor or participant" },
  { icon: Image, label: "Evidence", desc: "Photo + optional GPS" },
  { icon: Cpu, label: "AI verification", desc: "Scoring & fraud checks" },
  { icon: Coins, label: "Creditcoin settlement", desc: "Reward released on-chain" },
];

const spring = { type: "spring", stiffness: 300, damping: 26 };

export function LandingArchitectureSection() {
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
        How the protocol works
      </motion.h2>
      <motion.p
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-center text-muted-foreground max-w-xl mx-auto mb-12"
      >
        All verification and settlement run in the backend; the frontend focuses on clarity and the demo flow.
      </motion.p>
      <div className="max-w-md mx-auto space-y-0">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
            transition={spring}
            className="flex flex-col items-center"
          >
            <div className="rounded-xl border border-zinc-700/80 flex items-center gap-4 p-4 w-full bg-zinc-900/50">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <step.icon className="h-6 w-6 text-emerald-400" aria-hidden />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{step.label}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <ArrowDown className="h-6 w-6 text-zinc-500 my-1" aria-hidden />
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
          href="/protocol"
          className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
        >
          Read the protocol →
        </Link>
      </motion.div>
    </motion.section>
  );
}
