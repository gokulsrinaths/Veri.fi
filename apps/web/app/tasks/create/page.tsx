"use client";

import Link from "next/link";
import { Navbar, TaskForm } from "@/components/veriact";

export default function CreateTaskPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/tasks"
            className="text-white/70 hover:text-white text-sm focus-ring rounded-lg px-2 py-1 inline-block"
          >
            ← Back to tasks
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">Create task</h1>
          <p className="text-white/60 text-sm mt-1">Set reward, location, and verification rules.</p>
        </div>
        <TaskForm />
      </main>
    </div>
  );
}
