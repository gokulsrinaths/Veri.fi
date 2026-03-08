"use client";

import { motion } from "framer-motion";
import { Camera, Cpu, Coins } from "lucide-react";

const features = [
  {
    title: "Proof Submission",
    description:
      "Participants upload photo evidence with optional GPS. EXIF metadata extracted when available.",
    icon: Camera,
  },
  {
    title: "AI Verification",
    description:
      "Visual + location + timestamp + anti-fraud scoring. DeepInfra or OpenAI Vision when configured; mock verifier otherwise.",
    icon: Cpu,
  },
  {
    title: "On-Chain Settlement",
    description:
      "Verified proofs trigger reward release. Creditcoin testnet when configured; mock settlement for demo.",
    icon: Coins,
  },
];

const spring = { type: "spring", stiffness: 300, damping: 26 };

export function FeatureCards() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
      }}
      className="px-4 py-12 md:py-16 max-w-6xl mx-auto"
      style={{ backgroundColor: "#0a0a0a" }}
      aria-labelledby="features-heading"
    >
      <motion.h2
        id="features-heading"
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={spring}
        className="text-2xl md:text-3xl font-bold text-center mb-2"
        style={{ color: "#f4f4f5" }}
      >
        How it works
      </motion.h2>
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={spring}
        className="text-center text-sm md:text-base mb-10 max-w-xl mx-auto"
        style={{ color: "#a1a1aa" }}
      >
        From proof submission to on-chain reward.
      </motion.p>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((item, i) => (
          <motion.div
            key={item.title}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={spring}
            className="rounded-xl border border-zinc-700/80 p-6 h-full transition-colors hover:border-zinc-600/80"
            style={{ backgroundColor: "#18181b" }}
          >
            <item.icon
              className="h-8 w-8 mb-3"
              style={{ color: "#34d399" }}
              aria-hidden
            />
            <h3
              className="font-semibold text-lg mb-2"
              style={{ color: "#f4f4f5" }}
            >
              {item.title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#a1a1aa" }}
            >
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
