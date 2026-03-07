/**
 * Shared types for veri.fi - AI-verified Proof-of-Action protocol
 */

export type UserRole = "SPONSOR" | "PARTICIPANT" | "BOTH";

export type TaskStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "EXPIRED"
  | "CANCELLED";

export type SubmissionStatus =
  | "PENDING"
  | "VERIFYING"
  | "VERIFIED"
  | "REJECTED"
  | "PAID";

export type ProofType = "PHOTO" | "VIDEO";

export type TaskCategory =
  | "DePIN"
  | "RWA"
  | "Retail"
  | "Logistics"
  | "Event"
  | "Field Ops";

export interface ScoringWeights {
  location: number;
  time: number;
  visual: number;
  liveness: number;
  antiFraud: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  location: 0.3,
  time: 0.15,
  visual: 0.3,
  liveness: 0.1,
  antiFraud: 0.15,
};

export interface Task {
  id: string;
  sponsorId: string;
  title: string;
  description: string;
  category: TaskCategory;
  targetLatitude: number;
  targetLongitude: number;
  radiusMeters: number;
  requiredProofType: ProofType;
  expectedObjectLabel: string;
  rewardAmount: string;
  rewardToken: string;
  confidenceThreshold: number;
  maxSubmissions: number;
  status: TaskStatus;
  metadataJson?: Record<string, unknown>;
  onchainTaskId?: string;
  createdAt: string;
  scoringWeights?: ScoringWeights;
  deadline?: string;
}

export interface Submission {
  id: string;
  taskId: string;
  participantId: string;
  mediaUrl: string;
  mediaType: string;
  capturedLatitude?: number;
  capturedLongitude?: number;
  capturedAt: string;
  exifJson?: Record<string, unknown>;
  verificationStatus: SubmissionStatus;
  verificationScore?: number;
  scoreBreakdownJson?: ScoreBreakdown;
  evidenceHash?: string;
  onchainSubmissionId?: string;
  txHash?: string;
  createdAt: string;
}

export interface ScoreBreakdown {
  locationScore: number;
  timeScore: number;
  visualScore: number;
  livenessScore: number;
  antiFraudScore: number;
  finalScore: number;
  explanation?: string;
}

export interface VerificationResult {
  id: string;
  submissionId: string;
  locationScore: number;
  timeScore: number;
  visualScore: number;
  livenessScore: number;
  antiFraudScore: number;
  finalScore: number;
  decision: "ACCEPT" | "REJECT";
  explanation: string;
  createdAt: string;
}

export interface CaptureSession {
  taskId: string;
  sessionToken: string;
  startedAt: number;
  proofType: ProofType;
}
