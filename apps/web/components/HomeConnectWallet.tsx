"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { connectWallet } from "@/lib/creditcoin";
import { useWallet } from "@/components/WalletContext";
import { Wallet } from "lucide-react";

/**
 * Connect Wallet button for the home page.
 * Uses window.ethereum (MetaMask in Chrome) - when clicked, MetaMask extension
 * will open and ask the user to connect their account.
 */
export function HomeConnectWallet() {
  const router = useRouter();
  const { setAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const { address } = await connectWallet();
      setAddress(address);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect. Install MetaMask in Chrome.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base disabled:opacity-50"
        style={{ backgroundColor: "#34d399", color: "#0a0a0a" }}
      >
        <Wallet className="h-5 w-5" />
        {loading ? "Opening MetaMask…" : "Log in"}
      </button>
      {error && (
        <p
          className="text-sm max-w-md text-center"
          style={{ color: "#f87171" }}
          role="alert"
        >
          {error}
        </p>
      )}
      <p
        className="text-xs max-w-md text-center"
        style={{ color: "#71717a" }}
      >
        Opens your MetaMask extension in Chrome. After connecting, you’ll go to your dashboard.
      </p>
    </div>
  );
}
