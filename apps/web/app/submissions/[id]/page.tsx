"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import {
  Navbar,
  ScoreBreakdown,
  SettlementCard,
  StatusBadge,
  VerificationStepper,
} from "@/components/veriact";
import { submissionsApi } from "@/lib/veriact-api";
import type { Submission } from "@/types/veriact";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SubmissionResultPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => submissionsApi.get(id),
    enabled: !!id,
  });

  const sub = data as (Submission & { task?: { name: string; rewardAmount: string } }) | undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden />
              <p className="text-muted-foreground">Loading verification result…</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isError || !sub) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col gap-4 pt-6 pb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-10 w-10 text-destructive shrink-0" aria-hidden />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Submission not found</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    This submission may have expired, been removed, or the local demo store may have been reset.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/tasks">Back to Tasks</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const verified = sub.status === "VERIFIED" || sub.status === "PAID";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks" className="text-muted-foreground hover:text-foreground mb-6 inline-block">
            ← Back to tasks
          </Link>
        </Button>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-1">
            Verification complete
          </h2>
          <p className="text-xs text-muted-foreground mb-3">Pipeline summary</p>
          <VerificationStepper currentStep={5} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <h1 className="text-xl font-bold text-foreground mb-2">
                Verification result
              </h1>
              {sub.task?.name && (
                <p className="text-muted-foreground text-sm mb-4">
                  Task: {sub.task.name}
                </p>
              )}

              <div className="flex items-center gap-3 mb-6">
                {verified ? (
                  <CheckCircle className="h-10 w-10 text-primary" aria-hidden />
                ) : (
                  <XCircle className="h-10 w-10 text-destructive" aria-hidden />
                )}
                <div>
                  <StatusBadge status={sub.status} />
                  {sub.verificationScore != null && (
                    <p className="text-muted-foreground text-sm mt-1">
                      Score: {(sub.verificationScore * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>

              {sub.reasoning && (
                <p className="text-sm text-muted-foreground mb-6">{sub.reasoning}</p>
              )}

              {sub.scoreBreakdown && <ScoreBreakdown breakdown={sub.scoreBreakdown} />}
            </CardContent>
          </Card>
        </motion.div>

        {verified && sub.task && (
          <SettlementCard
            verified
            rewardAmount={sub.task.rewardAmount}
            txHash={sub.txHash}
          />
        )}
        {!verified && sub.task && (
          <SettlementCard verified={false} rewardAmount={sub.task.rewardAmount} />
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="flex-1">
            <Link href="/dashboard">View dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link href="/tasks">Explore tasks</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
