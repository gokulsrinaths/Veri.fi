"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, CheckCircle, Coins, Activity } from "lucide-react";

export function DashboardStats({
  totalTasks,
  verifiedSubmissions,
  rewardsReleased,
  recentActivity,
}: {
  totalTasks: number;
  verifiedSubmissions: number;
  rewardsReleased: string;
  recentActivity: Array<{ id: string; taskName: string; status: string; submittedAt: string; score?: number }>;
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="px-4 space-y-6"
    >
      <h2 className="text-xl font-bold text-white">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <LayoutDashboard className="w-8 h-8 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{totalTasks}</p>
          <p className="text-sm text-white/50">Total tasks</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{verifiedSubmissions}</p>
          <p className="text-sm text-white/50">Verified submissions</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <Coins className="w-8 h-8 text-emerald-400 mb-2" aria-hidden />
          <p className="text-2xl font-bold text-white">{rewardsReleased} CTC</p>
          <p className="text-sm text-white/50">Rewards released</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Recent activity</h3>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-white/50">No activity yet.</p>
        ) : (
          <ul className="space-y-2">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{a.taskName}</span>
                <span className="text-white/50">
                  {a.status} {a.score != null ? ` · ${(a.score * 100).toFixed(0)}%` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  );
}
