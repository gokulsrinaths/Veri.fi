import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import type { ScoringWeights } from "@verifi/shared";
import { DEFAULT_SCORING_WEIGHTS } from "@verifi/shared";
import { prisma } from "./prisma.js";

type SubmissionWithTask = Prisma.SubmissionGetPayload<{
  include: { task: true };
}>;

export interface VerificationOutput {
  locationScore: number;
  timeScore: number;
  visualScore: number;
  livenessScore: number;
  antiFraudScore: number;
  finalScore: number;
  decision: "ACCEPT" | "REJECT";
  explanation: string;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function locationScore(
  targetLat: number,
  targetLon: number,
  capturedLat: number | null,
  capturedLon: number | null,
  radiusMeters: number
): number {
  if (capturedLat == null || capturedLon == null) return 0;
  const dist = haversineDistance(targetLat, targetLon, capturedLat, capturedLon);
  if (dist <= radiusMeters) return 1;
  const decay = radiusMeters * 2;
  return Math.max(0, 1 - (dist - radiusMeters) / decay);
}

export function timeScore(capturedAt: Date, allowedMinutesFresh = 30): number {
  const now = Date.now();
  const captured = capturedAt.getTime();
  const diffMinutes = (now - captured) / (60 * 1000);
  if (diffMinutes < 0) return 0.5; // future timestamp
  if (diffMinutes <= allowedMinutesFresh) return 1;
  if (diffMinutes <= 60) return 0.7;
  if (diffMinutes <= 24 * 60) return 0.3;
  return 0.1;
}

export function visualScore(
  expectedObjectLabel: string,
  _mediaUrl: string,
  _mediaType: string
): number {
  const label = (expectedObjectLabel || "").toLowerCase();
  if (label.includes("ev charger") || label.includes("charger")) return 0.85;
  if (label.includes("store") || label.includes("retail")) return 0.8;
  if (label.includes("event") || label.includes("attendance")) return 0.8;
  return 0.75;
}

export function livenessScore(sessionToken: string | null, mediaType: string): number {
  if (sessionToken) return 0.95;
  if (mediaType.startsWith("video")) return 0.9;
  return 0.7;
}

async function antiFraudScore(
  submission: SubmissionWithTask,
  evidenceHash: string | null
): Promise<number> {
  if (!evidenceHash) return 0.5;
  const sameHash = await prisma.submission.findFirst({
    where: {
      taskId: submission.taskId,
      evidenceHash,
      id: { not: submission.id },
    },
  });
  if (sameHash) return 0;
  const hasLocation =
    submission.capturedLatitude != null && submission.capturedLongitude != null;
  const hasTime = submission.capturedAt != null;
  if (!hasLocation || !hasTime) return 0.6;
  return 0.95;
}

export async function runVerification(
  submission: SubmissionWithTask
): Promise<VerificationOutput> {
  const task = submission.task;
  const weights = (task.scoringWeightsJson as ScoringWeights) ?? DEFAULT_SCORING_WEIGHTS;

  const loc = locationScore(
    task.targetLatitude,
    task.targetLongitude,
    submission.capturedLatitude,
    submission.capturedLongitude,
    task.radiusMeters
  );
  const time = timeScore(submission.capturedAt);
  const visual = visualScore(
    task.expectedObjectLabel,
    submission.mediaUrl,
    submission.mediaType
  );
  const live = livenessScore(submission.sessionToken, submission.mediaType);
  const anti = await antiFraudScore(submission, submission.evidenceHash);

  const final =
    weights.location * loc +
    weights.time * time +
    weights.visual * visual +
    weights.liveness * live +
    weights.antiFraud * anti;

  const threshold = task.confidenceThreshold;
  const decision = final >= threshold ? "ACCEPT" : "REJECT";
  const explanation = [
    `Location: ${(loc * 100).toFixed(0)}%`,
    `Time: ${(time * 100).toFixed(0)}%`,
    `Visual: ${(visual * 100).toFixed(0)}%`,
    `Liveness: ${(live * 100).toFixed(0)}%`,
    `Anti-fraud: ${(anti * 100).toFixed(0)}%`,
    `Final: ${(final * 100).toFixed(0)}% (threshold ${(threshold * 100).toFixed(0)}%)`,
  ].join("; ");

  return {
    locationScore: loc,
    timeScore: time,
    visualScore: visual,
    livenessScore: live,
    antiFraudScore: anti,
    finalScore: final,
    decision,
    explanation,
  };
}
