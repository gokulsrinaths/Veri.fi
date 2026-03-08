"use client";

import { useState, useEffect } from "react";
import { connectWallet, getBalance } from "@/lib/creditcoin";
import { useWallet } from "@/components/WalletContext";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CreditcoinWallet() {
  const { address, setAddress } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    getBalance(address)
      .then((b) => { if (!cancelled) setBalance(b); })
      .catch(() => { if (!cancelled) setBalance("—"); });
    return () => { cancelled = true; };
  }, [address]);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const { address: addr } = await connectWallet();
      setAddress(addr);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    setBalance(null);
  };

  if (address) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center gap-2 p-3">
          <Wallet className="h-4 w-4 text-primary shrink-0" aria-hidden />
          <div className="text-left hidden sm:block min-w-0">
            <p
              className="text-xs text-muted-foreground truncate max-w-[120px]"
              title={address}
            >
              {address.slice(0, 6)}…{address.slice(-4)}
            </p>
            <p className="text-xs font-medium text-primary">
              {balance ?? "—"} CTC
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground shrink-0"
            onClick={handleDisconnect}
            aria-label="Log out and disconnect wallet"
          >
            Log out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        onClick={handleConnect}
        disabled={loading}
        className="text-primary border-primary/30 hover:bg-primary/10"
        aria-label="Log in with your wallet"
      >
        <Wallet className="h-4 w-4" />
        {loading ? "Connecting…" : "Log in"}
      </Button>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
