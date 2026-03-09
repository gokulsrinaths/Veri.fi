"use client";

import { motion } from "framer-motion";
import { Lock, Eye, Shield, Zap } from "lucide-react";

const reasons = [
  {
    icon: Lock,
    title: "Escrow",
    desc: "Rewards are held on-chain until verification passes. No trust in a single party to pay out.",
  },
  {
    icon: Eye,
    title: "Transparent settlement",
    desc: "Anyone can see when and why a reward was released. On-chain record of proof and payout.",
  },
  {
    icon: Shield,
    title: "Trust layer",
    desc: "Creditcoin provides the settlement layer; veri.fi adds the verification layer for real-world actions.",
  },
  {
    icon: Zap,
    title: "Programmable incentives",
    desc: "Sponsors set tasks and thresholds; the protocol executes payouts when conditions are met.",
  },
];

const spring = { type: "spring", stiffness: 300, damping: 26 };

export function WhyCreditcoinSection() {
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
        Why Creditcoin
      </motion.h2>
      <motion.p
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-center text-muted-foreground max-w-2xl mx-auto mb-12"
      >
        Creditcoin powers escrow, transparent settlement, and programmable incentives for verified real-world activity.
      </motion.p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reasons.map((item) => (
          <motion.div
            key={item.title}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={spring}
            className="rounded-xl border border-zinc-700/80 p-5 bg-zinc-900/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
          >
            <item.icon className="h-8 w-8 mb-3 text-emerald-400" aria-hidden />
            <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
