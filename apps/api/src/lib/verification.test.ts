import { describe, it, expect, vi } from "vitest";
import {
  locationScore,
  timeScore,
  visualScore,
  livenessScore,
  runVerification,
} from "./verification.js";

// Mock prisma for antiFraudScore
vi.mock("./prisma.js", () => ({
  prisma: {
    submission: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
}));

describe("verification", () => {
  it("locationScore is 1 when within radius", () => {
    const score = locationScore(37.77, -122.42, 37.77, -122.42, 500);
    expect(score).toBe(1);
  });

  it("locationScore decays outside radius", () => {
    const score = locationScore(37.77, -122.42, 37.78, -122.42, 100);
    expect(score).toBeLessThan(1);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it("timeScore is high for recent capture", () => {
    const score = timeScore(new Date());
    expect(score).toBe(1);
  });

  it("visualScore returns heuristic for EV charger", () => {
    const score = visualScore("EV charger", "/x.jpg", "image/jpeg");
    expect(score).toBeGreaterThanOrEqual(0.8);
  });

  it("livenessScore is higher with session token", () => {
    const withToken = livenessScore("sess-123", "image/jpeg");
    const without = livenessScore(null, "image/jpeg");
    expect(withToken).toBeGreaterThan(without);
  });

  it("runVerification returns decision and breakdown", async () => {
    const submission = {
      id: "sub-1",
      taskId: "task-1",
      mediaUrl: "/x.jpg",
      mediaType: "image/jpeg",
      capturedLatitude: 37.7749,
      capturedLongitude: -122.4194,
      capturedAt: new Date(),
      sessionToken: "sess-1",
      evidenceHash: "abc",
      task: {
        targetLatitude: 37.7749,
        targetLongitude: -122.4194,
        radiusMeters: 500,
        confidenceThreshold: 0.5,
        expectedObjectLabel: "EV charger",
        scoringWeightsJson: {
          location: 0.3,
          time: 0.15,
          visual: 0.3,
          liveness: 0.1,
          antiFraud: 0.15,
        },
      },
    } as any;
    const result = await runVerification(submission);
    expect(result.decision).toMatch(/ACCEPT|REJECT/);
    expect(result.finalScore).toBeGreaterThanOrEqual(0);
    expect(result.finalScore).toBeLessThanOrEqual(1);
    expect(result.explanation).toBeDefined();
  });
});
