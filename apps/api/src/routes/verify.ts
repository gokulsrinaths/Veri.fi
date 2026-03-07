import type { FastifyInstance } from "fastify";
import { runVerification } from "../lib/verification.js";
import { prisma } from "../lib/prisma.js";

export async function verifyRoutes(app: FastifyInstance) {
  app.post<{ Params: { submissionId: string } }>("/:submissionId", async (req, reply) => {
    const { submissionId } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: true },
    });
    if (!submission) return reply.status(404).send({ error: "Submission not found" });

    await prisma.submission.update({
      where: { id: submissionId },
      data: { verificationStatus: "VERIFYING" },
    });

    try {
      const result = await runVerification(submission);
      await prisma.verificationResult.upsert({
        where: { submissionId },
        create: {
          submissionId,
          locationScore: result.locationScore,
          timeScore: result.timeScore,
          visualScore: result.visualScore,
          livenessScore: result.livenessScore,
          antiFraudScore: result.antiFraudScore,
          finalScore: result.finalScore,
          decision: result.decision,
          explanation: result.explanation,
        },
        update: {
          locationScore: result.locationScore,
          timeScore: result.timeScore,
          visualScore: result.visualScore,
          livenessScore: result.livenessScore,
          antiFraudScore: result.antiFraudScore,
          finalScore: result.finalScore,
          decision: result.decision,
          explanation: result.explanation,
        },
      });

      const newStatus = result.decision === "ACCEPT" ? "VERIFIED" : "REJECTED";
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          verificationStatus: newStatus,
          verificationScore: result.finalScore,
          scoreBreakdownJson: {
            locationScore: result.locationScore,
            timeScore: result.timeScore,
            visualScore: result.visualScore,
            livenessScore: result.livenessScore,
            antiFraudScore: result.antiFraudScore,
            finalScore: result.finalScore,
            explanation: result.explanation,
          } as object,
        },
      });

      return reply.send(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      await prisma.submission.update({
        where: { id: submissionId },
        data: { verificationStatus: "REJECTED" },
      });
      return reply.status(500).send({ error: message });
    }
  });
}
