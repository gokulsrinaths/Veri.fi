import type { Task, Submission } from "@/types/veriact";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

// --- In-memory fallback when Supabase is not configured ---
const tasksMem: Map<string, Task> = new Map();
const submissionsMem: Map<string, Submission> = new Map();

function seedDefaultTaskMem() {
  const seed: Task = {
    id: "seed-ev-charger-21",
    name: "Verify EV Charger #21",
    description:
      "Confirm that EV Charger #21 is physically present and operational at the specified location.",
    expectedLocation: "Palo Alto EV Station",
    requiredEvidenceType: "Photo + GPS",
    rewardAmount: "5 CTC",
    threshold: 0.7,
    expectedObject: "EV Charger",
    status: "OPEN",
    createdAt: new Date().toISOString(),
    targetLatitude: 37.4419,
    targetLongitude: -122.143,
    radiusMeters: 200,
  };
  tasksMem.set(seed.id, seed);
}

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    expectedLocation: String(row.expected_location),
    requiredEvidenceType: (row.required_evidence_type as Task["requiredEvidenceType"]) ?? "Photo + GPS",
    rewardAmount: String(row.reward_amount ?? "5 CTC"),
    threshold: Number(row.threshold ?? 0.7),
    expectedObject: String(row.expected_object ?? "EV Charger"),
    status: (row.status as Task["status"]) ?? "OPEN",
    createdAt: String(row.created_at),
    sponsorWallet: row.sponsor_wallet != null ? String(row.sponsor_wallet) : undefined,
    onchainTaskId: row.onchain_task_id != null ? Number(row.onchain_task_id) : undefined,
    escrowTxHash: row.escrow_tx_hash != null ? String(row.escrow_tx_hash) : undefined,
    targetLatitude: row.target_latitude != null ? Number(row.target_latitude) : undefined,
    targetLongitude: row.target_longitude != null ? Number(row.target_longitude) : undefined,
    radiusMeters: row.radius_meters != null ? Number(row.radius_meters) : undefined,
  };
}

function rowToSubmission(row: Record<string, unknown>): Submission {
  const exifData = row.exif_data as Submission["exifData"];
  let manualLocation: Submission["manualLocation"] = null;
  if (row.manual_lat != null && row.manual_lng != null) {
    manualLocation = { lat: Number(row.manual_lat), lng: Number(row.manual_lng) };
  }
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    participantAddress: row.participant_address != null ? String(row.participant_address) : null,
    imageUrl: String(row.image_url),
    note: row.note != null ? String(row.note) : undefined,
    exifData: exifData ?? null,
    manualLocation,
    verificationScore: row.verification_score != null ? Number(row.verification_score) : undefined,
    status: (row.status as Submission["status"]) ?? "PENDING",
    reasoning: row.reasoning != null ? String(row.reasoning) : undefined,
    txHash: row.tx_hash != null ? String(row.tx_hash) : null,
    submittedAt: String(row.submitted_at),
    scoreBreakdown: row.score_breakdown as Submission["scoreBreakdown"],
  };
}

export async function getTasks(status?: Task["status"]): Promise<Task[]> {
  if (!isSupabaseConfigured()) {
    if (tasksMem.size === 0) seedDefaultTaskMem();
    const list = Array.from(tasksMem.values());
    if (status) return list.filter((t) => t.status === status);
    return list;
  }
  const supabase = getSupabaseClient();
  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const tasks = (data ?? []).map(rowToTask);
  return tasks;
}

export async function getTask(id: string): Promise<Task | undefined> {
  if (!isSupabaseConfigured()) {
    if (tasksMem.size === 0) seedDefaultTaskMem();
    return tasksMem.get(id);
  }
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error || !data) return undefined;
  return rowToTask(data);
}

export async function createTask(input: Omit<Task, "id" | "createdAt" | "status">): Promise<Task> {
  if (!isSupabaseConfigured()) {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const task: Task = {
      ...input,
      id,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    tasksMem.set(id, task);
    return task;
  }
  const supabase = getSupabaseClient();
  const row = {
    sponsor_wallet: input.sponsorWallet ?? null,
    name: input.name,
    description: input.description,
    expected_location: input.expectedLocation,
    required_evidence_type: input.requiredEvidenceType ?? "Photo + GPS",
    reward_amount: input.rewardAmount ?? "5 CTC",
    threshold: input.threshold ?? 0.7,
    expected_object: input.expectedObject ?? "EV Charger",
    target_latitude: typeof input.targetLatitude === "number" ? input.targetLatitude : null,
    target_longitude: typeof input.targetLongitude === "number" ? input.targetLongitude : null,
    radius_meters: input.radiusMeters ?? 200,
    onchain_task_id: input.onchainTaskId ?? null,
    escrow_tx_hash: input.escrowTxHash ?? null,
  };
  const { data, error } = await supabase.from("tasks").insert(row).select().single();
  if (error) throw new Error(error.message);
  return rowToTask(data);
}

export type TaskUpdateInput = Partial<Pick<Task, "name" | "description" | "expectedLocation" | "requiredEvidenceType" | "rewardAmount" | "threshold" | "expectedObject" | "status" | "targetLatitude" | "targetLongitude" | "radiusMeters">>;

export async function updateTask(id: string, input: TaskUpdateInput): Promise<Task | undefined> {
  if (!isSupabaseConfigured()) {
    const task = tasksMem.get(id);
    if (!task) return undefined;
    const next = { ...task, ...input };
    tasksMem.set(id, next);
    return next;
  }
  const supabase = getSupabaseClient();
  const row: Record<string, unknown> = {};
  if (input.name != null) row.name = input.name;
  if (input.description != null) row.description = input.description;
  if (input.expectedLocation != null) row.expected_location = input.expectedLocation;
  if (input.requiredEvidenceType != null) row.required_evidence_type = input.requiredEvidenceType;
  if (input.rewardAmount != null) row.reward_amount = input.rewardAmount;
  if (input.threshold != null) row.threshold = input.threshold;
  if (input.expectedObject != null) row.expected_object = input.expectedObject;
  if (input.status != null) row.status = input.status;
  if (input.targetLatitude !== undefined) row.target_latitude = input.targetLatitude;
  if (input.targetLongitude !== undefined) row.target_longitude = input.targetLongitude;
  if (input.radiusMeters != null) row.radius_meters = input.radiusMeters;
  row.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from("tasks").update(row).eq("id", id).select().single();
  if (error) return undefined;
  return rowToTask(data);
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    tasksMem.delete(id);
    Array.from(submissionsMem.entries()).forEach(([sid, s]) => {
      if (s.taskId === id) submissionsMem.delete(sid);
    });
    return true;
  }
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  return !error;
}

export async function addSubmission(
  taskId: string,
  data: {
    imageUrl: string;
    note?: string;
    exifData?: Submission["exifData"];
    manualLocation?: Submission["manualLocation"];
    participantAddress?: string | null;
  }
): Promise<Submission> {
  if (!isSupabaseConfigured()) {
    const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const submission: Submission = {
      id,
      taskId,
      imageUrl: data.imageUrl,
      note: data.note,
      exifData: data.exifData ?? null,
      manualLocation: data.manualLocation ?? null,
      participantAddress: data.participantAddress ?? null,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    };
    submissionsMem.set(id, submission);
    return submission;
  }
  const supabase = getSupabaseClient();
  const row = {
    task_id: taskId,
    participant_address: data.participantAddress ?? null,
    image_url: data.imageUrl,
    note: data.note ?? null,
    exif_data: data.exifData ?? null,
    manual_lat: data.manualLocation?.lat ?? null,
    manual_lng: data.manualLocation?.lng ?? null,
  };
  const { data: inserted, error } = await supabase.from("submissions").insert(row).select().single();
  if (error) throw new Error(error.message);
  return rowToSubmission(inserted);
}

export async function getSubmission(id: string): Promise<Submission | undefined> {
  if (!isSupabaseConfigured()) {
    return submissionsMem.get(id);
  }
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("submissions").select("*").eq("id", id).single();
  if (error || !data) return undefined;
  return rowToSubmission(data);
}

export async function updateSubmission(
  id: string,
  update: Partial<Pick<Submission, "status" | "verificationScore" | "reasoning" | "txHash" | "scoreBreakdown" | "participantAddress">>
): Promise<Submission | undefined> {
  if (!isSupabaseConfigured()) {
    const sub = submissionsMem.get(id);
    if (!sub) return undefined;
    const next = { ...sub, ...update };
    submissionsMem.set(id, next);
    return next;
  }
  const supabase = getSupabaseClient();
  const row: Record<string, unknown> = {};
  if (update.status != null) row.status = update.status;
  if (update.verificationScore != null) row.verification_score = update.verificationScore;
  if (update.reasoning != null) row.reasoning = update.reasoning;
  if (update.txHash != null) row.tx_hash = update.txHash;
  if (update.scoreBreakdown != null) row.score_breakdown = update.scoreBreakdown;
  if (update.participantAddress != null) row.participant_address = update.participantAddress;
  row.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from("submissions").update(row).eq("id", id).select().single();
  if (error) return undefined;
  return rowToSubmission(data);
}

export async function getSubmissionsByTaskId(taskId: string): Promise<Submission[]> {
  if (!isSupabaseConfigured()) {
    return Array.from(submissionsMem.values()).filter((s) => s.taskId === taskId);
  }
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("task_id", taskId)
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToSubmission);
}

export async function getDashboardStats(): Promise<{
  totalTasks: number;
  verifiedSubmissions: number;
  rewardsReleased: string;
  recentActivity: Array<{ id: string; taskName: string; status: string; submittedAt: string; score?: number }>;
}> {
  if (!isSupabaseConfigured()) {
    const allTasks = Array.from(tasksMem.values());
    const allSubs = Array.from(submissionsMem.values());
    const verified = allSubs.filter((s) => s.status === "VERIFIED" || s.status === "PAID");
    let rewardsReleased = 0;
    verified.forEach((s) => {
      const task = tasksMem.get(s.taskId);
      if (task) rewardsReleased += parseFloat(task.rewardAmount) || 0;
    });
    const recent = [...allSubs]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 10);
    return {
      totalTasks: allTasks.length,
      verifiedSubmissions: verified.length,
      rewardsReleased: rewardsReleased.toFixed(2),
      recentActivity: recent.map((s) => {
        const task = tasksMem.get(s.taskId);
        return {
          id: s.id,
          taskName: task?.name ?? "Unknown",
          status: s.status,
          submittedAt: s.submittedAt,
          score: s.verificationScore,
        };
      }),
    };
  }
  const supabase = getSupabaseClient();
  const [tasksRes, subsRes] = await Promise.all([
    supabase.from("tasks").select("id, name, reward_amount"),
    supabase.from("submissions").select("id, task_id, status, submitted_at, verification_score").order("submitted_at", { ascending: false }).limit(100),
  ]);
  if (tasksRes.error) throw new Error(tasksRes.error.message);
  if (subsRes.error) throw new Error(subsRes.error.message);
  const tasks = tasksRes.data ?? [];
  const subs = subsRes.data ?? [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const verified = subs.filter((s) => s.status === "VERIFIED" || s.status === "PAID");
  let rewardsReleased = 0;
  verified.forEach((s) => {
    const task = taskMap.get(s.task_id);
    if (task) rewardsReleased += parseFloat(String(task.reward_amount)) || 0;
  });
  const recent = subs.slice(0, 10);
  return {
    totalTasks: tasks.length,
    verifiedSubmissions: verified.length,
    rewardsReleased: rewardsReleased.toFixed(2),
    recentActivity: recent.map((s) => {
      const task = taskMap.get(s.task_id);
      return {
        id: s.id,
        taskName: task?.name ?? "Unknown",
        status: s.status,
        submittedAt: s.submitted_at,
        score: s.verification_score != null ? Number(s.verification_score) : undefined,
      };
    }),
  };
}

/** Insert verification result row (optional; scores also stored on submission). */
export async function insertVerificationResult(
  submissionId: string,
  result: {
    visualScore: number;
    locationScore: number;
    timestampScore: number;
    antiFraudScore: number;
    finalScore: number;
    verified: boolean;
    reasoning?: string;
  }
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  await supabase.from("verification_results").insert({
    submission_id: submissionId,
    visual_score: result.visualScore,
    location_score: result.locationScore,
    timestamp_score: result.timestampScore,
    anti_fraud_score: result.antiFraudScore,
    final_score: result.finalScore,
    verified: result.verified,
    reasoning: result.reasoning ?? null,
  });
}
