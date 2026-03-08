"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Navbar,
  DashboardStats,
  DashboardStatsSkeleton,
} from "@/components/veriact";
import { CreditcoinWallet } from "@/components/CreditcoinWallet";
import { useWallet } from "@/components/WalletContext";
import { dashboardApi } from "@/lib/veriact-api";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { isConnected, hasHydrated } = useWallet();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.stats(),
    enabled: isConnected,
  });

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="max-w-6xl mx-auto px-4 py-20 flex items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </main>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="max-w-lg mx-auto px-4 py-20 text-center">
          <Card className="border-dashed">
            <CardContent className="p-10">
              <Wallet className="h-14 w-14 text-muted-foreground/60 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Connect your wallet
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                Connect your wallet to view your dashboard and recent verification activity.
              </p>
              <CreditcoinWallet />
              <p className="text-xs text-muted-foreground mt-6">
                After connecting, you can explore tasks, create tasks, or view stats here.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="max-w-6xl mx-auto">
        <div className="px-4 py-8">
          {isLoading || !stats ? (
            <DashboardStatsSkeleton />
          ) : (
            <DashboardStats
              totalTasks={stats.totalTasks}
              verifiedSubmissions={stats.verifiedSubmissions}
              rewardsReleased={stats.rewardsReleased}
              recentActivity={stats.recentActivity as Array<{
                id: string;
                taskName: string;
                status: string;
                submittedAt: string;
                score?: number;
              }>}
            />
          )}
        </div>
      </main>
    </div>
  );
}
