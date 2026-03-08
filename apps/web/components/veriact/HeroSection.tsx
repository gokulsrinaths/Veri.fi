"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlusCircle, ListTodo, Zap } from "lucide-react";

const spring = { type: "spring", stiffness: 300, damping: 24 };
const stagger = 0.08;
const delayChildren = 0.2;

export function HeroSection() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
      className="text-center py-20 md:py-28 px-4"
      style={{ backgroundColor: "#0a0a0a", color: "#f4f4f5" }}
    >
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={spring}
        className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
        style={{ color: "#f4f4f5" }}
      >
        veri<span style={{ color: "#34d399" }}>.fi</span>
      </motion.h1>
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={spring}
        className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
        style={{ color: "#a1a1aa" }}
      >
        Turn real-world activity into programmable proof.
      </motion.p>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={spring}
        className="flex flex-wrap justify-center gap-4"
      >
        <Link
          href="/demo"
          className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-medium text-base border transition-all duration-200 ease-out min-h-[48px] min-w-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98] hover:scale-[1.02] hover:bg-zinc-800/80 hover:border-emerald-500/40"
          style={{
            borderColor: "#52525b",
            color: "#e4e4e7",
          }}
        >
          <Zap className="h-5 w-5 shrink-0" aria-hidden />
          Try Demo
        </Link>
        <Link
          href="/tasks/create"
          className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-semibold text-base transition-all duration-200 ease-out min-h-[48px] min-w-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98] hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25"
          style={{
            backgroundColor: "#34d399",
            color: "#0a0a0a",
            boxShadow: "0 4px 14px 0 rgba(52, 211, 153, 0.25)",
          }}
        >
          <PlusCircle className="h-5 w-5 shrink-0" aria-hidden />
          Create Task
        </Link>
        <Link
          href="/tasks"
          className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-medium text-base border transition-all duration-200 ease-out min-h-[48px] min-w-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98] hover:scale-[1.02] hover:bg-zinc-800/80"
          style={{
            borderColor: "#52525b",
            color: "#e4e4e7",
          }}
        >
          <ListTodo className="h-5 w-5 shrink-0" aria-hidden />
          Explore Tasks
        </Link>
      </motion.div>
    </motion.section>
  );
}
