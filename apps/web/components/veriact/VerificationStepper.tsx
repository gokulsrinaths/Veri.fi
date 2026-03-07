"use client";

import { motion } from "framer-motion";

const steps = [
  { id: "upload", label: "Upload received" },
  { id: "metadata", label: "Extracting metadata" },
  { id: "visual", label: "Running visual verification" },
  { id: "location", label: "Comparing location and timestamp" },
  { id: "score", label: "Calculating confidence score" },
];

export function VerificationStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border ${
              active ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/10 bg-white/5"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                done ? "bg-emerald-500 text-black" : active ? "bg-emerald-500/30 text-emerald-400" : "bg-white/10 text-white/50"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={active ? "text-white font-medium" : "text-white/60"}>{step.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
