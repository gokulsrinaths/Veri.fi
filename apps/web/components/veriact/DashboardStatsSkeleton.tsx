"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, CheckCircle, Coins, Activity } from "lucide-react";

export function DashboardStatsSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="px-4 space-y-6"
      aria-busy="true"
      aria-label="Dashboard loading"
    >
      <h2 className="text-xl font-bold text-white">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
          <LayoutDashboard className="w-8 h-8 text-white/20 mb-2" />
          <div className="h-8 w-12 bg-white/10 rounded mb-2" />
          <p className="text-sm text-white/40">Total tasks</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
          <CheckCircle className="w-8 h-8 text-white/20 mb-2" />
          <div className="h-8 w-12 bg-white/10 rounded mb-2" />
          <p className="text-sm text-white/40">Verified submissions</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
          <Coins className="w-8 h-8 text-white/20 mb-2" />
          <div className="h-8 w-16 bg-white/10 rounded mb-2" />
          <p className="text-sm text-white/40">Rewards released</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-white/20" />
          <h3 className="font-semibold text-white/40">Recent activity</h3>
        </div>
        <p className="text-sm text-white/30">Loading…</p>
      </div>
    </motion.section>
  );
}
