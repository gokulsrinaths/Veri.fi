/**
 * VeriAct MVP — API client (Next.js API routes)
 */

const API = "/api";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json();
}

export const tasksApi = {
  list: (status?: string) =>
    api<{ tasks: unknown[]; total: number }>(
      status ? `/tasks?status=${encodeURIComponent(status)}` : "/tasks"
    ),
  get: (id: string) => api<unknown>(`/tasks/${id}`),
  create: (body: {
    name: string;
    description: string;
    expectedLocation: string;
    requiredEvidenceType: string;
    rewardAmount: string;
    threshold: number;
    expectedObject: string;
    targetLatitude?: number;
    targetLongitude?: number;
    radiusMeters?: number;
  }) => api<unknown>("/tasks", { method: "POST", body: JSON.stringify(body) }),
};

export const submissionsApi = {
  create: (formData: FormData) =>
    fetch(`${API}/submissions`, { method: "POST", body: formData }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error?: string }).error || res.statusText);
      }
      return res.json();
    }),
  get: (id: string) => api<unknown>(`/submissions/${id}`),
};

export const dashboardApi = {
  stats: () => api<{ totalTasks: number; verifiedSubmissions: number; rewardsReleased: string; recentActivity: unknown[] }>("/dashboard"),
};
