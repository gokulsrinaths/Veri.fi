"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Navbar, TaskCard, EmptyState } from "@/components/veriact";
import { tasksApi } from "@/lib/veriact-api";
import type { Task } from "@/types/veriact";

export default function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.list("OPEN"),
  });

  const tasks = (data?.tasks ?? []) as Task[];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Explore tasks</h1>
        {isLoading ? (
          <div className="text-white/50">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No open tasks"
            description="Create a task to get started, or the seed task may not be loaded yet."
            action={
              <Link
                href="/tasks/create"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-black px-4 py-2 font-medium hover:bg-emerald-400 focus-ring min-h-[44px] items-center"
              >
                Create task
              </Link>
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
