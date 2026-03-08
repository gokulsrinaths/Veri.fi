"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { tasksApi, type TaskUpdateBody } from "@/lib/veriact-api";
import { useToast } from "@/components/ToastContext";
import { useWallet } from "@/components/WalletContext";
import {
  createTaskOnChain,
  parseRewardToWei,
  connectWallet,
} from "@/lib/creditcoin";
import type { RequiredEvidenceType, Task, LocationType } from "@/types/veriact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EVIDENCE_OPTIONS: RequiredEvidenceType[] = [
  "Photo",
  "Video",
  "Photo + GPS",
];

type TaskFormState = {
  name: string;
  description: string;
  locationType: LocationType;
  expectedLocation: string;
  targetLatitude: number | undefined;
  targetLongitude: number | undefined;
  requiredEvidenceType: RequiredEvidenceType;
  rewardAmount: string;
  threshold: number;
  expectedObject: string;
};

const defaultForm: TaskFormState = {
  name: "Verify EV Charger #21",
  description:
    "Confirm that EV Charger #21 is physically present and operational at the specified location.",
  locationType: "physical" as LocationType,
  expectedLocation: "Palo Alto EV Station",
  targetLatitude: 37.4419,
  targetLongitude: -122.143,
  requiredEvidenceType: "Photo + GPS" as RequiredEvidenceType,
  rewardAmount: "5 CTC",
  threshold: 0.7,
  expectedObject: "EV Charger",
};

export function TaskForm({ editTask }: { editTask?: Task | null }) {
  const router = useRouter();
  const toast = useToast();
  const { address: sponsorWallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(() =>
    editTask
      ? {
          name: editTask.name,
          description: editTask.description,
          locationType: (editTask.targetLatitude != null && editTask.targetLongitude != null
            ? "physical"
            : "online") as LocationType,
          expectedLocation: editTask.expectedLocation,
          targetLatitude: editTask.targetLatitude ?? 37.4419,
          targetLongitude: editTask.targetLongitude ?? -122.143,
          requiredEvidenceType: editTask.requiredEvidenceType,
          rewardAmount: editTask.rewardAmount,
          threshold: editTask.threshold,
          expectedObject: editTask.expectedObject,
        }
      : defaultForm
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.locationType === "physical") {
      const lat = form.targetLatitude;
      const lng = form.targetLongitude;
      if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
        setError("Latitude and longitude are required for physical location tasks.");
        setLoading(false);
        return;
      }
    }

    try {
      if (editTask) {
        const updatePayload: TaskUpdateBody = {
          name: form.name,
          description: form.description,
          expectedLocation: form.expectedLocation,
          requiredEvidenceType: form.requiredEvidenceType,
          rewardAmount: form.rewardAmount,
          threshold: form.threshold,
          expectedObject: form.expectedObject,
          ...(form.locationType === "physical"
            ? { targetLatitude: form.targetLatitude, targetLongitude: form.targetLongitude }
            : { targetLatitude: null, targetLongitude: null }),
        };
        await tasksApi.update(editTask.id, updatePayload);
        toast("Task updated");
        router.push(`/tasks/${editTask.id}`);
        return;
      }

      const contractAddress = process.env.NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS;
      const useEscrow = !!contractAddress;

      let onchainTaskId: number | undefined;
      let escrowTxHash: string | undefined;

      if (useEscrow) {
        await connectWallet();
        const rewardWei = parseRewardToWei(form.rewardAmount);
        if (rewardWei === BigInt(0)) {
          setError("Enter a valid reward amount (e.g. 5 or 0.1)");
          setLoading(false);
          return;
        }
        const { taskId, txHash } = await createTaskOnChain(rewardWei);
        onchainTaskId = taskId;
        escrowTxHash = txHash;
        toast("Reward escrowed on Creditcoin testnet");
      }

      await tasksApi.create({
        name: form.name,
        description: form.description,
        expectedLocation: form.expectedLocation,
        requiredEvidenceType: form.requiredEvidenceType,
        rewardAmount: form.rewardAmount,
        threshold: form.threshold,
        expectedObject: form.expectedObject,
        sponsorWallet: sponsorWallet ?? null,
        onchainTaskId,
        escrowTxHash,
        ...(form.locationType === "physical"
          ? { targetLatitude: form.targetLatitude, targetLongitude: form.targetLongitude }
          : { targetLatitude: null, targetLongitude: null }),
      });
      toast("Task created");
      router.push("/tasks");
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save task";
      if (msg.includes("MetaMask") || msg.includes("connect")) {
        setError("Connect wallet to create task");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-xl mx-auto"
    >
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">
            {editTask ? "Edit task" : "Create a new task"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {editTask ? "Update the task details below." : "Define the task, reward, and verification threshold."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="task-name">Task name</Label>
              <Input
                id="task-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Verify EV Charger #21"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="What should the participant prove?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-location-type">Location type</Label>
              <Select
                value={form.locationType}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    locationType: v as LocationType,
                    ...(v === "online" ? { targetLatitude: undefined, targetLongitude: undefined } : {}),
                  }))
                }
              >
                <SelectTrigger id="task-location-type">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online (no lat/long check)</SelectItem>
                  <SelectItem value="physical">Physical (require latitude & longitude)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-location">Expected location</Label>
              <Input
                id="task-location"
                value={form.expectedLocation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expectedLocation: e.target.value }))
                }
                placeholder={form.locationType === "online" ? "e.g. Online / Anywhere" : "e.g. Palo Alto EV Station"}
                required
              />
            </div>
            {form.locationType === "physical" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="task-lat">Latitude (required for physical)</Label>
                  <Input
                    id="task-lat"
                    type="number"
                    step="any"
                    value={form.targetLatitude ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        targetLatitude: e.target.value === "" ? undefined : Number(e.target.value),
                      }))
                    }
                    placeholder="e.g. 37.4419"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-lng">Longitude (required for physical)</Label>
                  <Input
                    id="task-lng"
                    type="number"
                    step="any"
                    value={form.targetLongitude ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        targetLongitude: e.target.value === "" ? undefined : Number(e.target.value),
                      }))
                    }
                    placeholder="e.g. -122.143"
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="task-evidence-type">Required evidence type</Label>
              <Select
                value={form.requiredEvidenceType}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    requiredEvidenceType: v as RequiredEvidenceType,
                  }))
                }
              >
                <SelectTrigger id="task-evidence-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVIDENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-reward">Reward amount</Label>
              <Input
                id="task-reward"
                value={form.rewardAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rewardAmount: e.target.value }))
                }
                placeholder="5 CTC"
                required
              />
            </div>
            <div className="space-y-3">
              <Label id="task-threshold-label">
                Acceptance threshold:{" "}
                <strong className="text-foreground">
                  {(form.threshold * 100).toFixed(0)}%
                </strong>
              </Label>
              <Slider
                value={[form.threshold * 100]}
                onValueChange={([v]) =>
                  setForm((f) => ({ ...f, threshold: (v ?? 70) / 100 }))
                }
                min={50}
                max={95}
                step={5}
                aria-labelledby="task-threshold-label"
                aria-valuetext={`${(form.threshold * 100).toFixed(0)} percent`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>95%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-expected-object">
                Demo object being verified
              </Label>
              <Input
                id="task-expected-object"
                value={form.expectedObject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expectedObject: e.target.value }))
                }
                placeholder="EV Charger"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  {editTask ? "Saving…" : "Creating…"}
                </>
              ) : (
                editTask ? "Save changes" : "Create task"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
