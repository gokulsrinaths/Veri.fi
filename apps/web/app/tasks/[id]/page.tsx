"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Coins, FileImage, Target } from "lucide-react";
import { Navbar, ProofUploadCard, StatusBadge } from "@/components/veriact";
import { tasksApi } from "@/lib/veriact-api";
import type { Task } from "@/types/veriact";

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });

  const t = task as Task | undefined;

  if (isLoading || !t) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/tasks" className="text-white/70 hover:text-white text-sm focus-ring rounded-lg px-2 py-1 inline-block">
          ← Back to tasks
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 mt-4 mb-6"
        >
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={t.status} />
            <span className="text-xs text-white/50 flex items-center gap-1">
              <FileImage className="w-3.5 h-3.5" />
              {t.requiredEvidenceType}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t.name}</h1>
          <p className="text-white/70 mb-4">{t.description}</p>
          <div className="space-y-2 text-sm text-white/60">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {t.expectedLocation}
            </p>
            <p className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              Reward: {t.rewardAmount}
            </p>
            <p className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Threshold: {(t.threshold * 100).toFixed(0)}% · Verify: {t.expectedObject}
            </p>
          </div>
        </motion.div>

        {t.status === "OPEN" && <ProofUploadCard task={t} />}
        {t.status !== "OPEN" && (
          <p className="text-white/50 text-sm">This task is no longer accepting submissions.</p>
        )}
      </main>
    </div>
  );
}
