"use client";

import { motion } from "framer-motion";
import { CheckCircle, Coins, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SettlementCard({
  verified,
  rewardAmount,
  txHash,
}: {
  verified: boolean;
  rewardAmount: string;
  txHash?: string | null;
}) {
  if (!verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-2">
              <XCircle className="h-10 w-10 text-muted-foreground shrink-0" aria-hidden />
              <div>
                <h3 className="font-semibold text-foreground">No reward released</h3>
                <p className="text-muted-foreground text-sm">
                  Verification did not meet threshold. No reward released.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Reward for this task: {rewardAmount}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Alert variant="success" className="border-primary/30 bg-primary/10 p-6">
        <CheckCircle className="h-10 w-10 text-primary" aria-hidden />
        <AlertDescription>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Reward released</h3>
                <p className="text-primary flex items-center gap-1 mt-0.5">
                  <Coins className="h-4 w-4" aria-hidden />
                  {rewardAmount}
                </p>
              </div>
            </div>
            {txHash && (
              <p className="text-xs text-muted-foreground font-mono break-all">
                Mock tx (demo only): {txHash}
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
