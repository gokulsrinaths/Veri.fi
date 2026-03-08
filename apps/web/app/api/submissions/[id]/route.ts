import { NextResponse } from "next/server";
import { getSubmission, getTask } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const submission = await getSubmission(id);
    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    const task = await getTask(submission.taskId);
    return NextResponse.json({ ...submission, task });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch submission" },
      { status: 500 }
    );
  }
}
