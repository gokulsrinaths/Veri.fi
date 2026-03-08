/**
 * VeriAct MVP — Task and Submission models
 */

export type TaskStatus = "OPEN" | "CLOSED" | "EXPIRED";
export type SubmissionStatus = "PENDING" | "VERIFYING" | "VERIFIED" | "REJECTED" | "PAID";
export type RequiredEvidenceType = "Photo" | "Video" | "Photo + GPS";
export type LocationType = "online" | "physical";

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
  /** Wallet address of the sponsor who created the task */
  sponsorWallet?: string | null;
  /** On-chain escrow task id (Creditcoin) */
  onchainTaskId?: number;
  /** Tx hash when reward was escrowed */
  escrowTxHash?: string;
  targetLatitude?: number | null;
  targetLongitude?: number | null;
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
  /** Participant wallet address (for on-chain payout) */
  participantAddress?: string | null;
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
