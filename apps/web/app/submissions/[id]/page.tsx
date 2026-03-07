"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Navbar,
  ScoreBreakdown,
  SettlementCard,
  StatusBadge,
  VerificationStepper,
} from "@/components/veriact";
import { submissionsApi } from "@/lib/veriact-api";
import type { Submission } from "@/types/veriact";

export default function SubmissionResultPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => submissionsApi.get(id),
    enabled: !!id,
  });

  const sub = data as (Submission & { task?: { name: string; rewardAmount: string } }) | undefined;

  if (isLoading || !sub) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  const verified = sub.status === "VERIFIED" || sub.status === "PAID";

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-6 focus-ring rounded-lg px-2 py-1"
        >
          ← Back to tasks
        </Link>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-white/60 mb-1">Verification complete</h2>
          <p className="text-xs text-white/50 mb-3">Pipeline summary</p>
          <VerificationStepper currentStep={5} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6"
        >
          <h1 className="text-xl font-bold text-white mb-2">Verification result</h1>
          {sub.task?.name && (
            <p className="text-white/60 text-sm mb-4">Task: {sub.task.name}</p>
          )}

          <div className="flex items-center gap-3 mb-6">
            {verified ? (
              <CheckCircle className="w-10 h-10 text-emerald-400" aria-hidden />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" aria-hidden />
            )}
            <div>
              <StatusBadge status={sub.status} />
              {sub.verificationScore != null && (
                <p className="text-white/60 text-sm mt-1">
                  Score: {(sub.verificationScore * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>

          {sub.reasoning && (
            <p className="text-sm text-white/60 mb-6">{sub.reasoning}</p>
          )}

          {sub.scoreBreakdown && <ScoreBreakdown breakdown={sub.scoreBreakdown} />}
        </motion.div>

        {verified && sub.task && (
          <SettlementCard
            verified
            rewardAmount={sub.task.rewardAmount}
            txHash={sub.txHash}
          />
        )}
        {!verified && sub.task && (
          <SettlementCard verified={false} rewardAmount={sub.task.rewardAmount} />
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl bg-emerald-500 text-black text-center font-semibold hover:bg-emerald-400 focus-ring min-h-[48px] flex items-center justify-center"
          >
            View dashboard
          </Link>
          <Link
            href="/tasks"
            className="flex-1 py-3 rounded-xl border border-white/20 text-center font-medium hover:bg-white/5 focus-ring min-h-[48px] flex items-center justify-center"
          >
            Explore tasks
          </Link>
        </div>
      </main>
    </div>
  );
}
