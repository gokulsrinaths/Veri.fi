"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Navbar, TaskForm } from "@/components/veriact";
import { CreditcoinWallet } from "@/components/CreditcoinWallet";
import { useWallet } from "@/components/WalletContext";
import { tasksApi } from "@/lib/veriact-api";
import type { Task } from "@/types/veriact";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";

export default function EditTaskPage() {
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
                Connect MetaMask to edit tasks
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
          <Link href={`/tasks/${id}`} className="text-muted-foreground hover:text-foreground">
            ← Back to task
          </Link>
        </Button>
        <div className="mt-4">
          <TaskForm editTask={t} />
        </div>
      </main>
    </div>
  );
}
