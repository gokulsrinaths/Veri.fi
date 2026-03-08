"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Coins, FileImage, Pencil, Trash2, Wallet } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tasksApi } from "@/lib/veriact-api";
import { useToast } from "@/components/ToastContext";
import type { Task } from "@/types/veriact";

function shortenWallet(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const spring = { type: "spring", stiffness: 400, damping: 30 };

export function TaskCard({
  task,
  index = 0,
  currentWallet,
}: {
  task: Task;
  index?: number;
  currentWallet?: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const isOwner = currentWallet && task.sponsorWallet && currentWallet.toLowerCase() === task.sponsorWallet.toLowerCase();

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast("Task removed");
      router.refresh();
    },
    onError: (e) => toast(e instanceof Error ? e.message : "Failed to remove task"),
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Remove this task? This cannot be undone and any submissions will be deleted.")) {
      deleteMutation.mutate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: index * 0.06 }}
    >
      <Card className="h-full border-border/80 overflow-hidden">
        <CardContent className="p-0">
          <Link href={`/tasks/${task.id}`} className="block p-6 pb-2 hover:opacity-95 transition-opacity">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={task.status} />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FileImage className="h-3.5 w-3.5" />
                {task.requiredEvidenceType}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {task.name}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {task.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-primary" />
                {task.rewardAmount}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {task.expectedLocation}
              </span>
              <span>
                Threshold: {(task.threshold * 100).toFixed(0)}%
              </span>
            </div>
          </Link>
          <div className="px-6 py-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
            {task.sponsorWallet ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" />
                Created by {shortenWallet(task.sponsorWallet)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">No sponsor wallet</span>
            )}
            {isOwner && (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/tasks/${task.id}/edit`} className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleRemove}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
