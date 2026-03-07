"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center"
    >
      <Inbox className="w-12 h-12 text-white/30 mx-auto mb-4" />
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-white/50 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </motion.div>
  );
}
