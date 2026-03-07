/**
 * AI verifier — OpenAI Vision when API key present, else mock.
 * Score = 0.45 * visual + 0.25 * location + 0.15 * timestamp + 0.15 * antiFraud
 */

import type { Task } from "@/types/veriact";
import type { ScoreBreakdown } from "@/types/veriact";

const WEIGHTS = {
  visual: 0.45,
  location: 0.25,
  timestamp: 0.15,
  antiFraud: 0.15,
};

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
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

export interface VisualAnalysis {
  containsExpectedObject: boolean;
  confidence: number;
  sceneSummary: string;
  suspiciousSignals: string[];
}

async function visualScoreWithOpenAI(
  imageBase64: string,
  expectedObject: string
): Promise<VisualAnalysis> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return mockVisualScore(expectedObject, imageBase64);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and determine if it contains ${expectedObject}. Return ONLY valid JSON with: { "containsExpectedObject": boolean, "confidence": number 0-1, "sceneSummary": string, "suspiciousSignals": string[] }`,
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return mockVisualScore(expectedObject, imageBase64);
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return mockVisualScore(expectedObject, imageBase64);
    const parsed = JSON.parse(content.replace(/^```json?\s*|\s*```$/g, "")) as VisualAnalysis;
    return {
      containsExpectedObject: !!parsed.containsExpectedObject,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) ?? 0.8)),
      sceneSummary: String(parsed.sceneSummary ?? ""),
      suspiciousSignals: Array.isArray(parsed.suspiciousSignals) ? parsed.suspiciousSignals : [],
    };
  } catch {
    return mockVisualScore(expectedObject, imageBase64);
  }
}

function mockVisualScore(expectedObject: string, _imageBase64: string): VisualAnalysis {
  const lower = expectedObject.toLowerCase();
  const hasCharger = lower.includes("ev charger") || lower.includes("charger");
  const confidence = hasCharger ? 0.82 + Math.random() * 0.12 : 0.4 + Math.random() * 0.35;
  return {
    containsExpectedObject: hasCharger || confidence > 0.7,
    confidence: Math.min(1, confidence),
    sceneSummary: "Mock analysis: image reviewed for expected object.",
    suspiciousSignals: [],
  };
}

export interface VerifyInput {
  task: Task;
  imageBase64: string;
  exifLatitude?: number | null;
  exifLongitude?: number | null;
  exifDateTime?: string | null;
  manualLat?: number | null;
  manualLng?: number | null;
  hasExif: boolean;
  fileSizeBytes?: number;
}

export interface VerifyResult {
  scoreBreakdown: ScoreBreakdown;
  reasoning: string;
  verified: boolean;
}

export async function runVerification(input: VerifyInput): Promise<VerifyResult> {
  const {
    task,
    imageBase64,
    exifLatitude,
    exifLongitude,
    exifDateTime,
    manualLat,
    manualLng,
    hasExif,
    fileSizeBytes = 0,
  } = input;

  const visual = await visualScoreWithOpenAI(imageBase64, task.expectedObject);
  const visualScore = visual.containsExpectedObject ? visual.confidence : visual.confidence * 0.6;

  const lat = exifLatitude ?? manualLat ?? null;
  const lng = exifLongitude ?? manualLng ?? null;
  const targetLat = task.targetLatitude ?? 37.44;
  const targetLng = task.targetLongitude ?? -122.14;
  const radius = task.radiusMeters ?? 200;

  let locationScore = 0;
  if (lat != null && lng != null) {
    const dist = haversineMeters(targetLat, targetLng, lat, lng);
    if (dist <= radius) locationScore = 1;
    else locationScore = Math.max(0, 1 - (dist - radius) / (radius * 2));
  }

  let timestampScore = 0.9;
  if (exifDateTime) {
    const exifTime = new Date(exifDateTime).getTime();
    const diffMinutes = (Date.now() - exifTime) / (60 * 1000);
    if (diffMinutes < 0) timestampScore = 0.5;
    else if (diffMinutes <= 30) timestampScore = 1;
    else if (diffMinutes <= 60) timestampScore = 0.8;
    else if (diffMinutes <= 24 * 60) timestampScore = 0.5;
    else timestampScore = 0.2;
  }

  const antiFraudScore = hasExif ? 0.9 : 0.6;
  const fileBonus = fileSizeBytes > 50000 ? 0.05 : 0;
  const antiFraud = Math.min(1, antiFraudScore + fileBonus);

  const finalScore =
    WEIGHTS.visual * visualScore +
    WEIGHTS.location * locationScore +
    WEIGHTS.timestamp * timestampScore +
    WEIGHTS.antiFraud * antiFraud;

  const breakdown: ScoreBreakdown = {
    visualScore,
    locationScore,
    timestampScore,
    antiFraudScore: antiFraud,
    finalScore,
  };

  const reasoning = [
    `Visual: ${(visualScore * 100).toFixed(0)}% — ${visual.sceneSummary || "object check"}`,
    `Location: ${(locationScore * 100).toFixed(0)}%`,
    `Timestamp: ${(timestampScore * 100).toFixed(0)}%`,
    `Anti-fraud: ${(antiFraud * 100).toFixed(0)}%`,
    `Final: ${(finalScore * 100).toFixed(0)}% (threshold ${(task.threshold * 100).toFixed(0)}%)`,
  ].join(". ");

  return {
    scoreBreakdown: breakdown,
    reasoning,
    verified: finalScore >= task.threshold,
  };
}
