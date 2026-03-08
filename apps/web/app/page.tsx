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
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0a0a0a", color: "#f4f4f5" }}
    >
      <Navbar />
      <main id="main-content" className="max-w-6xl mx-auto">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <LandingArchitectureSection />
        <HackathonAlignmentSection />
        <WhyCreditcoinSection />
        <DemoWalkthroughSection />
        <section className="px-4 py-14 md:py-20 text-center border-t border-zinc-800/80">
          <p
            className="mb-6 max-w-lg mx-auto"
            style={{ color: "#a1a1aa" }}
          >
            Connect your MetaMask wallet (Chrome extension) to view your dashboard and manage tasks.
          </p>
          <HomeConnectWallet />
          <p className="mt-6 text-sm" style={{ color: "#71717a" }}>
            Or{" "}
            <Link
              href="/dashboard"
              className="underline hover:no-underline"
              style={{ color: "#34d399" }}
            >
              go to dashboard
            </Link>{" "}
            and connect there.
          </p>
        </section>
      </main>
    </div>
  );
}
