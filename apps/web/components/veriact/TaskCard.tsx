"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Coins, FileImage } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Task } from "@/types/veriact";

export function TaskCard({ task, index = 0 }: { task: Task; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/tasks/${task.id}`}>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.08] transition backdrop-blur">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={task.status} />
            <span className="text-xs text-white/50 flex items-center gap-1">
              <FileImage className="w-3.5 h-3.5" />
              {task.requiredEvidenceType}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">{task.name}</h2>
          <p className="text-sm text-white/60 line-clamp-2 mb-4">{task.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-emerald-400" />
              {task.rewardAmount}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {task.expectedLocation}
            </span>
            <span className="text-white/40">Threshold: {(task.threshold * 100).toFixed(0)}%</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
