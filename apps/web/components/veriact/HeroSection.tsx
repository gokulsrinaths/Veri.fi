"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlusCircle, ListTodo } from "lucide-react";

export function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16 md:py-24 px-4"
    >
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
        Veri<span className="text-emerald-400">Act</span>
      </h1>
      <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
        Turn real-world activity into programmable proof.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/tasks/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 text-black px-6 py-3.5 font-semibold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 focus-ring"
        >
          <PlusCircle className="w-5 h-5" />
          Create Task
        </Link>
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 text-white px-6 py-3.5 font-medium hover:bg-white/10 transition backdrop-blur focus-ring"
        >
          <ListTodo className="w-5 h-5" />
          Explore Tasks
        </Link>
      </div>
    </motion.section>
  );
}
