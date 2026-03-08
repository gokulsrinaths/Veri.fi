"use client";

import { motion } from "framer-motion";
import { AlertCircle, ShieldOff, Users, Scale } from "lucide-react";

const problems = [
  {
    icon: AlertCircle,
    title: "Manual verification is expensive",
    desc: "Checking that real-world actions happened—inspections, audits, spot checks—doesn't scale and burns time and money.",
  },
  {
    icon: ShieldOff,
    title: "Fraud in self-reported proof",
    desc: "Trusting self-reported evidence is risky. Bad actors can fake photos, locations, or timestamps without a verification layer.",
  },
  {
    icon: Users,
    title: "Centralized trust bottlenecks",
    desc: "Single parties decide what counts as proof. No transparent, programmable rules or on-chain settlement.",
  },
  {
    icon: Scale,
    title: "Opaque reward settlement",
    desc: "Paying out for verified actions often stays off-chain or behind closed systems. No clear link between proof and payout.",
  },
];

const spring = { type: "spring", stiffness: 300, damping: 26 };

export function ProblemSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
      className="px-4 py-16 md:py-24 max-w-6xl mx-auto"
    >
      <motion.h2
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-2xl md:text-3xl font-bold text-center mb-2"
        style={{ color: "#f4f4f5" }}
      >
        The problem
      </motion.h2>
      <motion.p
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-center text-muted-foreground max-w-2xl mx-auto mb-12"
      >
        Proving real-world activity is hard to automate and trust. Manual checks don't scale; self-reports are easy to game.
      </motion.p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {problems.map((item) => (
          <motion.div
            key={item.title}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={spring}
            className="rounded-xl border border-zinc-700/80 p-5 bg-zinc-900/50 hover:border-zinc-600/80 transition-colors"
          >
            <item.icon className="h-8 w-8 mb-3 text-amber-400/90" aria-hidden />
            <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
