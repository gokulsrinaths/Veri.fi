import { z } from "zod";

export const scoringWeightsSchema = z.object({
  location: z.number().min(0).max(1),
  time: z.number().min(0).max(1),
  visual: z.number().min(0).max(1),
  liveness: z.number().min(0).max(1),
  antiFraud: z.number().min(0).max(1),
}).refine(
  (w) => Math.abs(w.location + w.time + w.visual + w.liveness + w.antiFraud - 1) < 0.01,
  { message: "Weights must sum to 1" }
);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.enum(["DePIN", "RWA", "Retail", "Logistics", "Event", "Field Ops"]),
  requiredProofType: z.enum(["PHOTO", "VIDEO"]),
  expectedObjectLabel: z.string().min(1).max(100),
  targetLatitude: z.number().min(-90).max(90),
  targetLongitude: z.number().min(-180).max(180),
  radiusMeters: z.number().min(10).max(50000),
  rewardAmount: z.string().regex(/^\d+(\.\d+)?$/),
  rewardToken: z.string().min(1),
  confidenceThreshold: z.number().min(0).max(1),
  maxSubmissions: z.number().int().min(1).max(1000),
  scoringWeights: scoringWeightsSchema.optional(),
  deadline: z.string().datetime().optional(),
});

export const createSubmissionSchema = z.object({
  taskId: z.string().min(1),
  mediaUrl: z.string().url(),
  mediaType: z.enum(["image/jpeg", "image/png", "video/mp4", "video/webm"]),
  capturedLatitude: z.number().min(-90).max(90).optional(),
  capturedLongitude: z.number().min(-180).max(180).optional(),
  capturedAt: z.string().datetime(),
  sessionToken: z.string().optional(),
  evidenceHash: z.string().optional(),
  exifJson: z.record(z.unknown()).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
