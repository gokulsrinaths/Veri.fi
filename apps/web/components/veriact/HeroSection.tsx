"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlusCircle, ListTodo } from "lucide-react";
import { useWallet } from "@/components/WalletContext";

const spring = { type: "spring", stiffness: 300, damping: 24 };
const stagger = 0.12;
const delayChildren = 0.2;

export function HeroSection() {
  const { isConnected } = useWallet();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
      className="relative text-center py-24 md:py-36 px-4 overflow-hidden bg-zinc-950"
    >
      {/* Gradient glow behind hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100%,600px)] h-[min(80%,400px)] bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-zinc-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={spring}
          className="text-sm uppercase tracking-[0.2em] text-emerald-400/90 mb-4 font-medium"
        >
          AI-verified proof of action
        </motion.p>
        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.98 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={spring}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-5 text-zinc-50"
        >
          veri<span className="text-emerald-400">.fi</span>
        </motion.h1>
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={spring}
          className="text-xl md:text-2xl max-w-2xl mx-auto mb-4 text-zinc-400 font-medium"
        >
          Prove it. Get paid.
        </motion.p>
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={spring}
          className="text-base md:text-lg max-w-xl mx-auto mb-12 text-zinc-500"
        >
          Turn real-world activity into programmable proof on Creditcoin.
        </motion.p>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={spring}
          className="flex flex-wrap justify-center gap-3 md:gap-4"
        >
          {isConnected ? (
            <>
              <Link
                href="/tasks/create"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-semibold text-base transition-all duration-200 ease-out min-h-[48px] min-w-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98] hover:scale-[1.02] bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <PlusCircle className="h-5 w-5 shrink-0" aria-hidden />
                Create Task
              </Link>
              <Link
                href="/tasks"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-medium text-base border border-zinc-600 text-zinc-300 transition-all duration-200 ease-out min-h-[48px] min-w-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98] hover:scale-[1.02] hover:bg-zinc-800/80 hover:border-zinc-500"
              >
                <ListTodo className="h-5 w-5 shrink-0" aria-hidden />
                Explore Tasks
              </Link>
            </>
          ) : (
            <Link
              href="#connect"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-semibold text-base transition-all duration-200 ease-out min-h-[48px] min-w-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98] hover:scale-[1.02] bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              Log in
            </Link>
          )}
        </motion.div>
        <motion.p
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-xs uppercase tracking-wider text-zinc-600"
        >
          Built on Creditcoin · On-chain settlement
        </motion.p>
      </div>
    </motion.section>
  );
}
