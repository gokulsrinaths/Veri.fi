"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ScoreBreakdown as ScoreBreakdownType } from "@/types/veriact";

const barColors = [
  "bg-primary",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
];

export function ScoreBreakdown({ breakdown }: { breakdown: ScoreBreakdownType }) {
  const items = [
    { label: "Visual", value: breakdown.visualScore },
    { label: "Location", value: breakdown.locationScore },
    { label: "Timestamp", value: breakdown.timestampScore },
    { label: "Anti-fraud", value: breakdown.antiFraudScore },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Score breakdown</h3>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <span className="text-sm text-muted-foreground w-24">
                  {item.label}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value * 100}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={cn("h-full rounded-full", barColors[i])}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-10 text-right">
                  {(item.value * 100).toFixed(0)}%
                </span>
              </motion.div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="font-semibold text-foreground">Final score</span>
              <span className="text-lg font-bold text-primary">
                {(breakdown.finalScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
