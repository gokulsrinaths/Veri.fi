import { NextResponse } from "next/server";
import { getTask, updateTask, deleteTask } from "@/lib/store";
import type { Task } from "@/types/veriact";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const task = await getTask(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = (await request.json()) as Partial<{
      name: string;
      description: string;
      expectedLocation: string;
      requiredEvidenceType: Task["requiredEvidenceType"];
      rewardAmount: string;
      threshold: number;
      expectedObject: string;
      status: Task["status"];
      targetLatitude: number | null;
      targetLongitude: number | null;
      radiusMeters: number;
    }>;
    const task = await updateTask(id, {
      name: body.name,
      description: body.description,
      expectedLocation: body.expectedLocation,
      requiredEvidenceType: body.requiredEvidenceType,
      rewardAmount: body.rewardAmount,
      threshold: body.threshold,
      expectedObject: body.expectedObject,
      status: body.status,
      targetLatitude: body.targetLatitude,
      targetLongitude: body.targetLongitude,
      radiusMeters: body.radiusMeters,
    });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update task" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const ok = await deleteTask(id);
    if (!ok) return NextResponse.json({ error: "Task not found or could not delete" }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete task" },
      { status: 500 }
    );
  }
}
