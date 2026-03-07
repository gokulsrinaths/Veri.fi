const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function api<T>(path: string, options?: RequestInit & { wallet?: string }): Promise<T> {
  const { wallet, ...rest } = options || {};
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  };
  if (wallet) (headers as Record<string, string>)["x-wallet-address"] = wallet;

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json();
}

export const apiTasks = {
  list: (params?: { category?: string; status?: string }) =>
    api<{ tasks: unknown[]; total: number }>(
      `/tasks?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),
  get: (id: string) => api<unknown>(`/tasks/${id}`),
  create: (body: unknown, wallet: string) =>
    api<unknown>("/tasks", { method: "POST", body: JSON.stringify(body), wallet }),
};

export const apiSubmissions = {
  presign: (taskId: string, filename: string, contentType: string, wallet: string) =>
    api<{ mediaUrl: string; uploadPath: string }>("/submissions/presign", {
      method: "POST",
      body: JSON.stringify({ taskId, filename, contentType }),
      wallet,
    }),
  create: (body: unknown, wallet: string) =>
    api<unknown>("/submissions", { method: "POST", body: JSON.stringify(body), wallet }),
  get: (id: string) => api<unknown>(`/submissions/${id}`),
  getResult: (id: string) =>
    api<{ verificationStatus: string; verificationScore?: number; scoreBreakdownJson?: unknown; txHash?: string }>(
      `/submissions/${id}/result`
    ),
};

export const apiVerify = {
  run: (submissionId: string) =>
    api<unknown>(`/verify/${submissionId}`, { method: "POST" }),
};

export const apiSettle = {
  run: (submissionId: string) =>
    api<{ success: boolean; txHash?: string | null }>(`/settle/${submissionId}`, { method: "POST" }),
};

export const apiDashboard = {
  summary: (wallet: string) =>
    api<{
      createdTasks: unknown[];
      submissions: unknown[];
      verifiedActions: unknown[];
      stats: { created: number; submitted: number; verified: number };
    }>("/dashboard/summary", { wallet }),
};
