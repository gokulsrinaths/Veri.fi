import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t border-zinc-800 px-4 py-8 mt-auto"
      style={{ backgroundColor: "#0a0a0a" }}
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight px-2 py-1.5 rounded-lg hover:opacity-90"
          style={{ color: "#f4f4f5" }}
          aria-label="veri.fi home"
        >
          veri<span style={{ color: "#34d399" }}>.fi</span>
        </Link>
        <p
          className="text-sm text-center sm:text-right max-w-md"
          style={{ color: "#71717a" }}
        >
          Turn real-world activity into programmable proof. Prove it. Get paid.
        </p>
      </div>
    </footer>
  );
}
