"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import type { ScoreBreakdown as ScoreBreakdownType } from "@/types/veriact";

export function ScoreBreakdown({ breakdown }: { breakdown: ScoreBreakdownType }) {
  const items = [
    { label: "Visual", value: breakdown.visualScore, color: "bg-emerald-500" },
    { label: "Location", value: breakdown.locationScore, color: "bg-blue-500" },
    { label: "Timestamp", value: breakdown.timestampScore, color: "bg-amber-500" },
    { label: "Anti-fraud", value: breakdown.antiFraudScore, color: "bg-violet-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-white">Score breakdown</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-sm text-white/70 w-24">{item.label}</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${item.color}`}
              />
            </div>
            <span className="text-sm font-medium text-white w-10 text-right">
              {(item.value * 100).toFixed(0)}%
            </span>
          </div>
        ))}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="font-semibold text-white">Final score</span>
          <span className="text-lg font-bold text-emerald-400">
            {(breakdown.finalScore * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
