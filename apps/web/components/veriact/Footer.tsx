import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t border-zinc-800 px-4 py-10 mt-auto bg-zinc-950"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight px-2 py-1.5 rounded-lg hover:opacity-90 text-zinc-50"
            aria-label="veri.fi home"
          >
            veri<span className="text-emerald-400">.fi</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8" aria-label="Footer navigation">
            <Link href="/protocol" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
              Protocol
            </Link>
            <Link href="/how-it-works" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
              How it works
            </Link>
            <Link href="/demo" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
              Demo
            </Link>
            <Link href="/tasks" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
              Explore Tasks
            </Link>
          </nav>
        </div>
        <p className="text-sm text-center sm:text-right text-zinc-500 max-w-md sm:ml-auto mt-4">
          Turn real-world activity into programmable proof. Prove it. Get paid.
        </p>
        <p className="text-xs text-center sm:text-right text-zinc-600 mt-2">
          Built on Creditcoin · On-chain settlement
        </p>
      </div>
    </footer>
  );
}
