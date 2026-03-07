import { NextResponse } from "next/server";
import { getSubmission, getTask } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const submission = getSubmission(id);
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  const task = getTask(submission.taskId);
  return NextResponse.json({ ...submission, task });
}
