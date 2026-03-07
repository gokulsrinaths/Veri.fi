"use client";

import { motion } from "framer-motion";
import { CheckCircle, Coins, XCircle } from "lucide-react";

export function SettlementCard({
  verified,
  rewardAmount,
  txHash,
}: {
  verified: boolean;
  rewardAmount: string;
  txHash?: string | null;
}) {
  if (!verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-white/20 bg-white/5 p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <XCircle className="w-10 h-10 text-white/50" aria-hidden />
          <div>
            <h3 className="font-semibold text-white">No reward released</h3>
            <p className="text-white/60 text-sm">
              Verification did not meet threshold. No reward released.
            </p>
          </div>
        </div>
        <p className="text-sm text-white/50">
          Reward for this task: {rewardAmount}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle className="w-10 h-10 text-emerald-400" aria-hidden />
        <div>
          <h3 className="font-semibold text-white">Reward released</h3>
          <p className="text-emerald-400 flex items-center gap-1">
            <Coins className="w-4 h-4" aria-hidden />
            {rewardAmount}
          </p>
        </div>
      </div>
      {txHash && (
        <p className="text-xs text-white/50 font-mono break-all">
          Mock tx (demo only): {txHash}
        </p>
      )}
    </motion.div>
  );
}
