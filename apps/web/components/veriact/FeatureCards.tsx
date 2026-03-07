"use client";

import { motion } from "framer-motion";
import { Camera, Cpu, Coins } from "lucide-react";

const features = [
  {
    title: "Proof Submission",
    description: "Participants upload photo evidence with optional GPS. EXIF metadata extracted when available.",
    icon: Camera,
  },
  {
    title: "AI Verification",
    description: "Visual + location + timestamp + anti-fraud scoring. OpenAI Vision when configured; mock verifier otherwise.",
    icon: Cpu,
  },
  {
    title: "On-Chain Settlement",
    description: "Verified proofs trigger reward release. Mock settlement for demo; ready for Creditcoin integration.",
    icon: Coins,
  },
];

export function FeatureCards() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="grid md:grid-cols-3 gap-6 px-4"
    >
      {features.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur hover:bg-white/[0.07] transition"
        >
          <item.icon className="w-8 h-8 text-emerald-400 mb-3" />
          <h3 className="font-semibold text-white mb-2">{item.title}</h3>
          <p className="text-sm text-white/60">{item.description}</p>
        </motion.div>
      ))}
    </motion.section>
  );
}
