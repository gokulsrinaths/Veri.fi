import { NextResponse } from "next/server";
import { addSubmission, getSubmission, updateSubmission, getTask, updateTask, insertVerificationResult } from "@/lib/store";
import { uploadProofImage } from "@/lib/storage";
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
    const participantAddress = formData.get("participantAddress") as string | null;

    if (!file || !taskId) {
      return NextResponse.json(
        { error: "Missing file or taskId" },
        { status: 400 }
      );
    }

    const task = await getTask(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    let imageUrl: string;
    try {
      const uploadedUrl = await uploadProofImage(file, taskId);
      imageUrl = uploadedUrl ?? `data:${file.type};base64,${base64}`;
    } catch (e) {
      imageUrl = `data:${file.type};base64,${base64}`;
    }

    const exif = extractExif(buffer);
    const hasExif = !!(exif && (exif.latitude != null || exif.longitude != null || exif.dateTime));

    const manual =
      manualLat != null && manualLng != null && String(manualLat).trim() !== "" && String(manualLng).trim() !== ""
        ? { lat: Number(manualLat), lng: Number(manualLng) }
        : null;

    const submission = await addSubmission(taskId, {
      imageUrl,
      note: note ?? undefined,
      exifData: exif ? { latitude: exif.latitude, longitude: exif.longitude, dateTime: exif.dateTime } : null,
      manualLocation: manual,
      participantAddress: participantAddress && participantAddress.trim() ? participantAddress.trim() : null,
    });

    await updateSubmission(submission.id, { status: "VERIFYING" });

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

    await updateSubmission(submission.id, {
      status: verifyResult.verified ? "VERIFIED" : "REJECTED",
      verificationScore: verifyResult.scoreBreakdown.finalScore,
      reasoning: verifyResult.reasoning,
      scoreBreakdown: verifyResult.scoreBreakdown,
    });

    await insertVerificationResult(submission.id, {
      visualScore: verifyResult.scoreBreakdown.visualScore,
      locationScore: verifyResult.scoreBreakdown.locationScore,
      timestampScore: verifyResult.scoreBreakdown.timestampScore,
      antiFraudScore: verifyResult.scoreBreakdown.antiFraudScore,
      finalScore: verifyResult.scoreBreakdown.finalScore,
      verified: verifyResult.verified,
      reasoning: verifyResult.reasoning,
    });

    if (verifyResult.verified) {
      const settlement = await settleReward(taskId, submission.id, task.rewardAmount, {
        onchainTaskId: task.onchainTaskId,
        participantAddress: submission.participantAddress ?? undefined,
      });
      await updateSubmission(submission.id, { status: "PAID", txHash: settlement.txHash ?? null });
      await updateTask(taskId, { status: "CLOSED" });
    }

    const updated = await getSubmission(submission.id);
    const taskAgain = await getTask(taskId);
    return NextResponse.json({ ...updated, task: taskAgain });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Submission failed" },
      { status: 500 }
    );
  }
}
