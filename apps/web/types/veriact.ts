/**
 * VeriAct MVP — Task and Submission models
 */

export type TaskStatus = "OPEN" | "CLOSED" | "EXPIRED";
export type SubmissionStatus = "PENDING" | "VERIFYING" | "VERIFIED" | "REJECTED" | "PAID";
export type RequiredEvidenceType = "Photo" | "Video" | "Photo + GPS";

export interface Task {
  id: string;
  name: string;
  description: string;
  expectedLocation: string;
  requiredEvidenceType: RequiredEvidenceType;
  rewardAmount: string;
  threshold: number;
  expectedObject: string;
  status: TaskStatus;
  createdAt: string;
  /** For location scoring — optional lat/lng for demo */
  targetLatitude?: number;
  targetLongitude?: number;
  radiusMeters?: number;
}

export interface ExifData {
  latitude?: number;
  longitude?: number;
  dateTime?: string;
  [key: string]: unknown;
}

export interface Submission {
  id: string;
  taskId: string;
  imageUrl: string;
  note?: string;
  exifData?: ExifData | null;
  manualLocation?: { lat: number; lng: number } | null;
  verificationScore?: number;
  status: SubmissionStatus;
  reasoning?: string;
  txHash?: string | null;
  submittedAt: string;
  scoreBreakdown?: ScoreBreakdown;
}

export interface ScoreBreakdown {
  visualScore: number;
  locationScore: number;
  timestampScore: number;
  antiFraudScore: number;
  finalScore: number;
}
