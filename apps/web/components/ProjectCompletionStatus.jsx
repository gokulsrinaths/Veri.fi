"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

const initialModules = [
  { id: 1, name: "Wallet Login", completed: true },
  { id: 2, name: "Creditcoin Network Connection", completed: true },
  { id: 3, name: "Task Creation", completed: true },
  { id: 4, name: "Proof Upload", completed: true },
  { id: 5, name: "AI Image Verification", completed: false },
  { id: 6, name: "Smart Contract Reward Settlement", completed: false },
  { id: 7, name: "Dashboard UI", completed: false },
];

export function ProjectCompletionStatus() {
  const [modules] = useState(initialModules);

  const totalModules = modules.length;
  const completedModules = modules.filter((m) => m.completed).length;
  const progressPercentage =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-6 max-w-md">
      <h2 className="text-lg font-semibold text-white mb-4">
        Project Completion Status
      </h2>

      <ul className="space-y-2 mb-6">
        {modules.map((module) => (
          <li
            key={module.id}
            className="flex items-center gap-2 text-sm"
          >
            {module.completed ? (
              <Check className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
            ) : (
              <X className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
            )}
            <span
              className={
                module.completed ? "text-zinc-200" : "text-zinc-500"
              }
            >
              {module.name}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-zinc-400 mb-2">
        Progress: {completedModules} / {totalModules}
      </p>
      <p className="text-sm font-medium text-white mb-3">
        Completion: {progressPercentage}%
      </p>

      <div
        className="h-2 w-full rounded-full bg-zinc-700 overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Project completion progress"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
