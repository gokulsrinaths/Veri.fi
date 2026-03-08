"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Coins, FileImage, Target, Wallet, Loader2 } from "lucide-react";
import { Navbar, ProofUploadCard, StatusBadge } from "@/components/veriact";
import { CreditcoinWallet } from "@/components/CreditcoinWallet";
import { useWallet } from "@/components/WalletContext";
import { tasksApi } from "@/lib/veriact-api";
import type { Task } from "@/types/veriact";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isConnected } = useWallet();

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id && isConnected,
  });

  const t = task as Task | undefined;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks" className="text-muted-foreground hover:text-foreground">
              ← Back to tasks
            </Link>
          </Button>
          <Card className="border-amber-500/30 bg-amber-500/5 mt-6">
            <CardContent className="flex flex-col items-center gap-4 pt-6 pb-6 text-center">
              <Wallet className="h-10 w-10 text-amber-500" aria-hidden />
              <p className="text-foreground font-medium">
                Connect MetaMask to view this task
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                You need to connect your wallet before you can view task details and submit proof.
              </p>
              <CreditcoinWallet />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isLoading || !t) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks" className="text-muted-foreground hover:text-foreground">
              ← Back to tasks
            </Link>
          </Button>
          <Card className="border-border mt-6">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden />
              <p className="text-muted-foreground">Loading task…</p>
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
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks" className="text-muted-foreground hover:text-foreground">
            ← Back to tasks
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusBadge status={t.status} />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileImage className="h-3.5 w-3.5" />
                  {t.requiredEvidenceType}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{t.name}</h1>
              <p className="text-muted-foreground mb-4">{t.description}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t.expectedLocation}
                </p>
                <p className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  Reward: {t.rewardAmount}
                </p>
                <p className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Threshold: {(t.threshold * 100).toFixed(0)}% · Verify: {t.expectedObject}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {t.status === "OPEN" && <ProofUploadCard task={t} />}
        {t.status !== "OPEN" && (
          <p className="text-muted-foreground text-sm">
            This task is no longer accepting submissions.
          </p>
        )}
      </main>
    </div>
  );
}
