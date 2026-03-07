"use client";

import { motion } from "framer-motion";

const steps = [
  { num: 1, title: "Create or browse tasks", desc: "Sponsors define tasks and rewards; participants find open tasks." },
  { num: 2, title: "Submit proof", desc: "Upload a photo (and optional GPS). EXIF or manual location supported." },
  { num: 3, title: "Verify & get paid", desc: "AI + rules verify; score vs threshold determines payout; mock settlement completes the flow." },
];

export function HowItWorks() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="px-4 py-12 md:py-16"
    >
      <h2 className="text-2xl font-bold text-white mb-8 text-center">How it works</h2>
      <div className="max-w-3xl mx-auto space-y-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * i, duration: 0.4 }}
            className="flex gap-4 items-start rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
              {step.num}
            </span>
            <div>
              <h3 className="font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-white/60 mt-0.5">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
