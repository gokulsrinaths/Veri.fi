"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  { id: "upload", label: "Upload received" },
  { id: "metadata", label: "Extracting metadata" },
  { id: "visual", label: "Running visual verification" },
  { id: "location", label: "Comparing location and timestamp" },
  { id: "score", label: "Calculating confidence score" },
];

const spring = { type: "spring", stiffness: 400, damping: 30 };

export function VerificationStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: i * 0.08 }}
          >
            <motion.div
              animate={{
                scale: active ? 1.02 : 1,
                transition: { duration: 0.2 },
              }}
            >
              <Card
                className={cn(
                  "border-2 transition-colors duration-200",
                  active
                    ? "border-primary/40 bg-primary/10 shadow-md shadow-primary/5"
                    : "border-border bg-card"
                )}
              >
                <CardContent className="flex items-center gap-3 py-2.5 px-4">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors duration-200",
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                          ? "bg-primary/30 text-primary scale-110"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm transition-colors duration-200",
                      active ? "font-medium text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
