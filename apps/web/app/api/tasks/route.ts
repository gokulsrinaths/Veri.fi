import { NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/store";
import type { Task } from "@/types/veriact";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as Task["status"] | null;
  try {
    const tasks = await getTasks(status ?? undefined);
    return NextResponse.json({ tasks, total: tasks.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name: string;
      description: string;
      expectedLocation: string;
      requiredEvidenceType: Task["requiredEvidenceType"];
      rewardAmount: string;
      threshold: number;
      expectedObject: string;
      sponsorWallet?: string | null;
      targetLatitude?: number;
      targetLongitude?: number;
      radiusMeters?: number;
      onchainTaskId?: number;
      escrowTxHash?: string;
    };
    const task = await createTask({
      name: body.name,
      description: body.description,
      expectedLocation: body.expectedLocation,
      requiredEvidenceType: body.requiredEvidenceType ?? "Photo + GPS",
      rewardAmount: body.rewardAmount ?? "5 CTC",
      threshold: typeof body.threshold === "number" ? body.threshold : 0.7,
      expectedObject: body.expectedObject ?? "EV Charger",
      sponsorWallet: body.sponsorWallet ?? null,
      targetLatitude: body.targetLatitude ?? 37.4419,
      targetLongitude: body.targetLongitude ?? -122.143,
      radiusMeters: body.radiusMeters ?? 200,
      onchainTaskId: body.onchainTaskId,
      escrowTxHash: body.escrowTxHash,
    });
    return NextResponse.json(task);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create task" },
      { status: 400 }
    );
  }
}
