import type { Task, Submission } from "@/types/veriact";

const tasks: Map<string, Task> = new Map();
const submissions: Map<string, Submission> = new Map();
const taskIdBySubmission: Map<string, string> = new Map();

function seedDefaultTask() {
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
  tasks.set(seed.id, seed);
}

export function getTasks(status?: Task["status"]): Task[] {
  if (tasks.size === 0) seedDefaultTask();
  const list = Array.from(tasks.values());
  if (status) return list.filter((t) => t.status === status);
  return list;
}

export function getTask(id: string): Task | undefined {
  if (tasks.size === 0) seedDefaultTask();
  return tasks.get(id);
}

export function createTask(input: Omit<Task, "id" | "createdAt" | "status">): Task {
  const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const task: Task = {
    ...input,
    id,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };
  tasks.set(id, task);
  return task;
}

export function addSubmission(
  taskId: string,
  data: {
    imageUrl: string;
    note?: string;
    exifData?: Submission["exifData"];
    manualLocation?: Submission["manualLocation"];
  }
): Submission {
  const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const submission: Submission = {
    id,
    taskId,
    imageUrl: data.imageUrl,
    note: data.note,
    exifData: data.exifData ?? null,
    manualLocation: data.manualLocation ?? null,
    status: "PENDING",
    submittedAt: new Date().toISOString(),
  };
  submissions.set(id, submission);
  taskIdBySubmission.set(id, taskId);
  return submission;
}

export function getSubmission(id: string): Submission | undefined {
  return submissions.get(id);
}

export function updateSubmission(
  id: string,
  update: Partial<Pick<Submission, "status" | "verificationScore" | "reasoning" | "txHash" | "scoreBreakdown">>
): Submission | undefined {
  const sub = submissions.get(id);
  if (!sub) return undefined;
  const next = { ...sub, ...update };
  submissions.set(id, next);
  return next;
}

export function getSubmissionsByTaskId(taskId: string): Submission[] {
  return Array.from(submissions.values()).filter((s) => s.taskId === taskId);
}

export function getDashboardStats() {
  const allTasks = Array.from(tasks.values());
  const allSubs = Array.from(submissions.values());
  const verified = allSubs.filter((s) => s.status === "VERIFIED" || s.status === "PAID");
  let rewardsReleased = 0;
  verified.forEach((s) => {
    const task = tasks.get(s.taskId);
    if (task) rewardsReleased += parseFloat(task.rewardAmount) || 0;
  });
  const recent = [...allSubs].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  ).slice(0, 10);
  return {
    totalTasks: allTasks.length,
    verifiedSubmissions: verified.length,
    rewardsReleased: rewardsReleased.toFixed(2),
    recentActivity: recent.map((s) => {
      const task = tasks.get(s.taskId);
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
