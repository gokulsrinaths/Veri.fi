/**
 * AI verifier — DeepInfra (Llama vision) or OpenAI Vision when API key present, else mock.
 * Image is checked according to the task (name, description, expected object, location).
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

const DEEPINFRA_BASE = "https://api.deepinfra.com/v1/openai";
const DEEPINFRA_VISION_MODEL = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8";

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

function buildTaskPrompt(task: Task): string {
  return [
    `Task: ${task.name}`,
    `Description: ${task.description}`,
    `Expected object to verify in the image: ${task.expectedObject}`,
    `Expected location (for context): ${task.expectedLocation}`,
    "",
    "Look at the image and decide whether it satisfies this task. Does the image clearly show the expected object/evidence described above?",
    "Return ONLY valid JSON with no markdown or extra text: { \"containsExpectedObject\": true or false, \"confidence\": number between 0 and 1, \"sceneSummary\": string describing what you see, \"suspiciousSignals\": array of strings (empty if none) }",
  ].join("\n");
}

function parseVisualResponse(content: string): VisualAnalysis | null {
  try {
    const cleaned = content.replace(/^```json?\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      containsExpectedObject: !!parsed.containsExpectedObject,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) ?? 0.5)),
      sceneSummary: String(parsed.sceneSummary ?? ""),
      suspiciousSignals: Array.isArray(parsed.suspiciousSignals)
        ? (parsed.suspiciousSignals as string[])
        : [],
    };
  } catch {
    return null;
  }
}

/** DeepInfra vision API (OpenAI-compatible). Checks image according to task. */
async function visualScoreWithDeepInfra(
  imageBase64: string,
  task: Task
): Promise<VisualAnalysis> {
  const key = process.env.DEEPINFRA_API_KEY;
  if (!key) return mockVisualScore(task.expectedObject, imageBase64);

  const prompt = buildTaskPrompt(task);
  const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

  try {
    const res = await fetch(`${DEEPINFRA_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: DEEPINFRA_VISION_MODEL,
        max_tokens: 4092,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) return mockVisualScore(task.expectedObject, imageBase64);

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return mockVisualScore(task.expectedObject, imageBase64);

    const parsed = parseVisualResponse(content);
    if (parsed) return parsed;
    return mockVisualScore(task.expectedObject, imageBase64);
  } catch {
    return mockVisualScore(task.expectedObject, imageBase64);
  }
}

async function visualScoreWithOpenAI(
  imageBase64: string,
  task: Task
): Promise<VisualAnalysis> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return mockVisualScore(task.expectedObject, imageBase64);

  const prompt = buildTaskPrompt(task);

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
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return mockVisualScore(task.expectedObject, imageBase64);
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return mockVisualScore(task.expectedObject, imageBase64);
    const parsed = parseVisualResponse(content);
    if (parsed) return parsed;
    return mockVisualScore(task.expectedObject, imageBase64);
  } catch {
    return mockVisualScore(task.expectedObject, imageBase64);
  }
}

/** Resolve visual analysis: DeepInfra first, then OpenAI, then mock. */
async function runVisualCheck(imageBase64: string, task: Task): Promise<VisualAnalysis> {
  if (process.env.DEEPINFRA_API_KEY) {
    return visualScoreWithDeepInfra(imageBase64, task);
  }
  if (process.env.OPENAI_API_KEY) {
    return visualScoreWithOpenAI(imageBase64, task);
  }
  return mockVisualScore(task.expectedObject, imageBase64);
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

  const visual = await runVisualCheck(imageBase64, task);
  const visualScore = visual.containsExpectedObject ? visual.confidence : visual.confidence * 0.6;

  const lat = exifLatitude ?? manualLat ?? null;
  const lng = exifLongitude ?? manualLng ?? null;
  const targetLat = task.targetLatitude ?? 37.44;
  const targetLng = task.targetLongitude ?? -122.14;
  const radius = task.radiusMeters ?? 200;

  let locationScore = 1;
  const isPhysicalLocation = task.targetLatitude != null && task.targetLongitude != null;
  if (isPhysicalLocation) {
    if (lat != null && lng != null) {
      const dist = haversineMeters(targetLat, targetLng, lat, lng);
      if (dist <= radius) locationScore = 1;
      else locationScore = Math.max(0, 1 - (dist - radius) / (radius * 2));
    } else {
      locationScore = 0;
    }
  }
  // Online tasks: no lat/long check, full location score

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
