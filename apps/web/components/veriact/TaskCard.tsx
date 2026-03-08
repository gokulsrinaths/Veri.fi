"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Coins, FileImage } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { Task } from "@/types/veriact";

const spring = { type: "spring", stiffness: 400, damping: 30 };

export function TaskCard({ task, index = 0 }: { task: Task; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: index * 0.06 }}
    >
      <Link href={`/tasks/${task.id}`} className="block">
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.99 }}
        >
          <Card className="h-full border-border/80">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusBadge status={task.status} />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileImage className="h-3.5 w-3.5" />
                  {task.requiredEvidenceType}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {task.name}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {task.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-primary" />
                  {task.rewardAmount}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {task.expectedLocation}
                </span>
                <span>
                  Threshold: {(task.threshold * 100).toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}
