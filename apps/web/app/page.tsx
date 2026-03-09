"use client";

import Link from "next/link";
import {
  Navbar,
  HeroSection,
  ProblemSection,
  SolutionSection,
  LandingArchitectureSection,
  HackathonAlignmentSection,
  WhyCreditcoinSection,
  DemoWalkthroughSection,
} from "@/components/veriact";
import { HomeConnectWallet } from "@/components/HomeConnectWallet";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Navbar />
      <main id="main-content" className="max-w-6xl mx-auto">
        <HeroSection />
        <ProblemSection />
        {/* Bridge: narrative between problem and solution */}
        <section className="px-4 py-8 md:py-12 text-center border-t border-zinc-800/80 bg-zinc-900/30">
          <p className="text-lg md:text-xl font-medium text-zinc-300 max-w-2xl mx-auto">
            Veri.fi turns proof into programmable payouts.
          </p>
        </section>
        <SolutionSection />
        <LandingArchitectureSection />
        <HackathonAlignmentSection />
        <WhyCreditcoinSection />
        <DemoWalkthroughSection />
        <section className="px-4 py-14 md:py-20 text-center border-t border-zinc-800/80 bg-zinc-950">
          <h2 className="text-2xl font-bold text-zinc-50 mb-2">Ready to prove it?</h2>
          <p className="mb-8 max-w-lg mx-auto text-zinc-400">
            Connect your MetaMask wallet to create tasks, submit proof, and get verified.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/tasks/create"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Create Task
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-medium border border-zinc-600 text-zinc-200 hover:bg-zinc-800/80 hover:border-emerald-500/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Go to Dashboard
            </Link>
          </div>
          <HomeConnectWallet />
          <p className="mt-6 text-sm text-zinc-500">
            Or{" "}
            <Link href="/dashboard" className="text-emerald-400 underline hover:no-underline">
              open dashboard
            </Link>{" "}
            and connect your wallet there.
          </p>
        </section>
      </main>
    </div>
  );
}
