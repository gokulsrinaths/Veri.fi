"use client";

import { motion } from "framer-motion";
import { Camera, Cpu, Coins } from "lucide-react";

const solutions = [
  {
    icon: Camera,
    title: "Evidence submission",
    desc: "Participants submit photo proof with optional GPS. EXIF and manual location are validated by the backend.",
  },
  {
    icon: Cpu,
    title: "AI verification",
    desc: "Visual, location, timestamp, and anti-fraud scoring run server-side. Only verified submissions pass the threshold.",
  },
  {
    icon: Coins,
    title: "On-chain settlement",
    desc: "Creditcoin releases the reward to the participant when verification passes. Transparent and programmable.",
  },
];

const spring = { type: "spring", stiffness: 300, damping: 26 };

export function SolutionSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
      className="px-4 py-16 md:py-24 max-w-6xl mx-auto border-t border-zinc-800/80"
    >
      <motion.h2
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-2xl md:text-3xl font-bold text-center mb-2"
        style={{ color: "#f4f4f5" }}
      >
        What veri.fi solves
      </motion.h2>
      <motion.p
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-center text-muted-foreground max-w-2xl mx-auto mb-12"
      >
        Turn real-world activity into programmable proof: submit evidence, get it verified, receive rewards on-chain.
      </motion.p>
      <div className="grid md:grid-cols-3 gap-6">
        {solutions.map((item) => (
          <motion.div
            key={item.title}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={spring}
            className="rounded-xl border border-zinc-700/80 p-6 bg-zinc-900/50 hover:border-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5"
          >
            <item.icon className="h-8 w-8 mb-3 text-emerald-400" aria-hidden />
            <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
