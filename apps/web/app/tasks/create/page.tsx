"use client";

import Link from "next/link";
import { Navbar, TaskForm } from "@/components/veriact";
import { Button } from "@/components/ui/button";
import { CreditcoinWallet } from "@/components/CreditcoinWallet";
import { useWallet } from "@/components/WalletContext";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function CreateTaskPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks" className="text-muted-foreground hover:text-foreground">
                ← Back to tasks
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground mt-2">Create task</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Set reward, location, and verification rules.
            </p>
          </div>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex flex-col items-center gap-4 pt-6 pb-6 text-center">
              <Wallet className="h-10 w-10 text-amber-500" aria-hidden />
              <p className="text-foreground font-medium">
                Wallet is not connected
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Connect MetaMask to create a task and escrow rewards on Creditcoin testnet.
              </p>
              <CreditcoinWallet />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks" className="text-muted-foreground hover:text-foreground">
              ← Back to tasks
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground mt-2">Create task</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set reward, location, and verification rules.
          </p>
        </div>
        <TaskForm />
      </main>
    </div>
  );
}
