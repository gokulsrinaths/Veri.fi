"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { tasksApi } from "@/lib/veriact-api";
import { useToast } from "@/components/ToastContext";
import type { RequiredEvidenceType } from "@/types/veriact";

const EVIDENCE_OPTIONS: RequiredEvidenceType[] = ["Photo", "Video", "Photo + GPS"];

const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus-ring";
const labelClass = "block text-sm font-medium text-white/80 mb-1.5";

export function TaskForm() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "Verify EV Charger #21",
    description: "Confirm that EV Charger #21 is physically present and operational at the specified location.",
    expectedLocation: "Palo Alto EV Station",
    requiredEvidenceType: "Photo + GPS" as RequiredEvidenceType,
    rewardAmount: "5 CTC",
    threshold: 0.7,
    expectedObject: "EV Charger",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await tasksApi.create({
        name: form.name,
        description: form.description,
        expectedLocation: form.expectedLocation,
        requiredEvidenceType: form.requiredEvidenceType,
        rewardAmount: form.rewardAmount,
        threshold: form.threshold,
        expectedObject: form.expectedObject,
      });
      toast("Task created");
      router.push("/tasks");
      return;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label htmlFor="task-name" className={labelClass}>
          Task name
        </label>
        <input
          id="task-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
          placeholder="e.g. Verify EV Charger #21"
          required
        />
      </div>
      <div>
        <label htmlFor="task-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="task-description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className={inputClass + " resize-none"}
          placeholder="What should the participant prove?"
          required
        />
      </div>
      <div>
        <label htmlFor="task-location" className={labelClass}>
          Expected location
        </label>
        <input
          id="task-location"
          value={form.expectedLocation}
          onChange={(e) => setForm((f) => ({ ...f, expectedLocation: e.target.value }))}
          className={inputClass}
          placeholder="e.g. Palo Alto EV Station"
          required
        />
      </div>
      <div>
        <label htmlFor="task-evidence-type" className={labelClass}>
          Required evidence type
        </label>
        <select
          id="task-evidence-type"
          value={form.requiredEvidenceType}
          onChange={(e) => setForm((f) => ({ ...f, requiredEvidenceType: e.target.value as RequiredEvidenceType }))}
          className={inputClass}
        >
          {EVIDENCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="task-reward" className={labelClass}>
          Reward amount
        </label>
        <input
          id="task-reward"
          value={form.rewardAmount}
          onChange={(e) => setForm((f) => ({ ...f, rewardAmount: e.target.value }))}
          className={inputClass}
          placeholder="5 CTC"
          required
        />
      </div>
      <div>
        <label id="task-threshold-label" className={labelClass}>
          Acceptance threshold: <strong className="text-white">{(form.threshold * 100).toFixed(0)}%</strong>
        </label>
        <input
          type="range"
          min={0.5}
          max={0.95}
          step={0.05}
          value={form.threshold}
          onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) }))}
          className="w-full h-2 rounded-full bg-white/10 accent-emerald-500 focus-ring"
          aria-labelledby="task-threshold-label"
          aria-valuetext={`${(form.threshold * 100).toFixed(0)} percent`}
        />
        <div className="flex justify-between text-xs text-white/50 mt-1">
          <span>50%</span>
          <span>95%</span>
        </div>
      </div>
      <div>
        <label htmlFor="task-expected-object" className={labelClass}>
          Demo object being verified
        </label>
        <input
          id="task-expected-object"
          value={form.expectedObject}
          onChange={(e) => setForm((f) => ({ ...f, expectedObject: e.target.value }))}
          className={inputClass}
          placeholder="EV Charger"
          required
        />
      </div>
      {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-semibold flex items-center justify-center gap-2 hover:bg-emerald-400 transition disabled:opacity-50 focus-ring min-h-[48px]"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : "Create task"}
      </button>
    </motion.form>
  );
}
