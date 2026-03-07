import { NextResponse } from "next/server";
import { addSubmission, getSubmission, updateSubmission, getTask } from "@/lib/store";
import { extractExif } from "@/lib/exif";
import { runVerification } from "@/lib/verifier";
import { settleReward } from "@/lib/contractService";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const taskId = formData.get("taskId") as string | null;
    const note = formData.get("note") as string | null;
    const manualLat = formData.get("manualLat");
    const manualLng = formData.get("manualLng");

    if (!file || !taskId) {
      return NextResponse.json(
        { error: "Missing file or taskId" },
        { status: 400 }
      );
    }

    const task = getTask(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const exif = extractExif(buffer);
    const hasExif = !!(exif && (exif.latitude != null || exif.longitude != null || exif.dateTime));

    const manual =
      manualLat != null && manualLng != null && String(manualLat).trim() !== "" && String(manualLng).trim() !== ""
        ? { lat: Number(manualLat), lng: Number(manualLng) }
        : null;

    const submission = addSubmission(taskId, {
      imageUrl: dataUrl,
      note: note ?? undefined,
      exifData: exif ? { latitude: exif.latitude, longitude: exif.longitude, dateTime: exif.dateTime } : null,
      manualLocation: manual,
    });

    updateSubmission(submission.id, { status: "VERIFYING" });

    const verifyResult = await runVerification({
      task,
      imageBase64: base64,
      exifLatitude: exif?.latitude ?? null,
      exifLongitude: exif?.longitude ?? null,
      exifDateTime: exif?.dateTime ?? null,
      manualLat: manual?.lat ?? null,
      manualLng: manual?.lng ?? null,
      hasExif,
      fileSizeBytes: buffer.length,
    });

    updateSubmission(submission.id, {
      status: verifyResult.verified ? "VERIFIED" : "REJECTED",
      verificationScore: verifyResult.scoreBreakdown.finalScore,
      reasoning: verifyResult.reasoning,
      scoreBreakdown: verifyResult.scoreBreakdown,
    });

    if (verifyResult.verified) {
      const settlement = await settleReward(taskId, submission.id, task.rewardAmount);
      updateSubmission(submission.id, { status: "PAID", txHash: settlement.txHash ?? null });
    }

    const updated = getSubmission(submission.id);
    const taskAgain = getTask(taskId);
    return NextResponse.json({ ...updated, task: taskAgain });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Submission failed" },
      { status: 500 }
    );
  }
}
