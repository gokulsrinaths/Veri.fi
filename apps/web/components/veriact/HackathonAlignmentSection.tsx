"use client";

import { motion } from "framer-motion";
import { Wifi, Building2, Coins } from "lucide-react";

const tracks = [
  {
    icon: Wifi,
    title: "DePIN",
    desc: "Verify physical infrastructure: EV chargers, telecom nodes, sensors, coverage. Proof of presence and operation.",
  },
  {
    icon: Building2,
    title: "RWA",
    desc: "Validate real-world assets: inspections, logistics events, condition checks. Attest state of physical things.",
  },
  {
    icon: Coins,
    title: "DeFi settlement",
    desc: "Escrow and release rewards on Creditcoin. Transparent, programmable payouts when verification passes.",
  },
];

const spring = { type: "spring", stiffness: 300, damping: 26 };

export function HackathonAlignmentSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
      className="px-4 py-16 md:py-24 max-w-6xl mx-auto border-t border-zinc-800/80"
    >
      <motion.h2
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-2xl md:text-3xl font-bold text-center mb-2"
        style={{ color: "#f4f4f5" }}
      >
        Build for the real world
      </motion.h2>
      <motion.p
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-center text-muted-foreground max-w-2xl mx-auto mb-4"
      >
        veri.fi fits the BUIDL CTC Hackathon tracks: real-world coordination, verification, and infrastructure.
      </motion.p>
      <motion.p
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        transition={spring}
        className="text-center text-sm text-muted-foreground max-w-xl mx-auto mb-12"
      >
        DePIN · RWA · DeFi settlement
      </motion.p>
      <div className="grid md:grid-cols-3 gap-6">
        {tracks.map((item) => (
          <motion.div
            key={item.title}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={spring}
            className="rounded-xl border border-zinc-700/80 p-6 bg-zinc-900/50 hover:border-zinc-600/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
          >
            <item.icon className="h-8 w-8 mb-3 text-emerald-400" aria-hidden />
            <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
