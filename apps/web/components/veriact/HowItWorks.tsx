"use client";

import { motion } from "framer-motion";
import { ListOrdered } from "lucide-react";

const steps = [
  {
    num: 1,
    title: "Create or browse tasks",
    desc: "Sponsors define tasks and rewards; participants find open tasks.",
  },
  {
    num: 2,
    title: "Submit proof",
    desc: "Upload a photo (and optional GPS). EXIF or manual location supported.",
  },
  {
    num: 3,
    title: "Verify & get paid",
    desc: "AI + rules verify; score vs threshold determines payout. Settlement on Creditcoin testnet or fallback when not configured.",
  },
];

const spring = { type: "spring", stiffness: 300, damping: 26 };

export function HowItWorks() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
      }}
      className="px-4 pt-4 pb-14 md:pb-20 max-w-6xl mx-auto"
      style={{ backgroundColor: "#0a0a0a" }}
      aria-labelledby="steps-heading"
    >
      <motion.h2
        id="steps-heading"
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={spring}
        className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2"
        style={{ color: "#a1a1aa" }}
      >
        <ListOrdered className="h-5 w-5 shrink-0" style={{ color: "#34d399" }} aria-hidden />
        The flow
      </motion.h2>
      <div className="max-w-3xl space-y-4">
        {steps.map((step) => (
          <motion.div
            key={step.num}
            variants={{
              hidden: { opacity: 0, x: -16 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={spring}
          >
            <div
              className="rounded-xl border border-zinc-700/80 flex gap-4 items-start p-5 transition-colors hover:border-zinc-600/80"
              style={{ backgroundColor: "#18181b" }}
            >
              <span
                className="flex-shrink-0 w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm"
                style={{ backgroundColor: "rgba(52, 211, 153, 0.2)", color: "#34d399" }}
                aria-hidden
              >
                {step.num}
              </span>
              <div className="min-w-0">
                <h3
                  className="font-semibold"
                  style={{ color: "#f4f4f5" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm mt-0.5 leading-relaxed"
                  style={{ color: "#a1a1aa" }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
