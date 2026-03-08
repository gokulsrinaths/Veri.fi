"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Navbar, TaskCard, EmptyState } from "@/components/veriact";
import { Button } from "@/components/ui/button";
import { CreditcoinWallet } from "@/components/CreditcoinWallet";
import { useWallet } from "@/components/WalletContext";
import { tasksApi } from "@/lib/veriact-api";
import type { Task } from "@/types/veriact";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function TasksPage() {
  const { isConnected } = useWallet();
  const { data, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.list("OPEN"),
    enabled: isConnected,
  });

  const tasks = (data?.tasks ?? []) as Task[];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Explore tasks</h1>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex flex-col items-center gap-4 pt-6 pb-6 text-center">
              <Wallet className="h-10 w-10 text-amber-500" aria-hidden />
              <p className="text-foreground font-medium">
                Connect MetaMask to view tasks
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                You need to connect your wallet before you can browse and interact with tasks.
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
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Explore tasks</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No open tasks"
            description="Create a task to get started, or the seed task may not be loaded yet."
            action={
              <Button asChild>
                <Link href="/tasks/create">Create task</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {tasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
