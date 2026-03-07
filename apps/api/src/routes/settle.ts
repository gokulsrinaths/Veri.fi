import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { settleOnChain } from "../lib/settlement.js";

export async function settleRoutes(app: FastifyInstance) {
  app.post<{ Params: { submissionId: string } }>("/:submissionId", async (req, reply) => {
    const { submissionId } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: true, participant: true },
    });
    if (!submission) return reply.status(404).send({ error: "Submission not found" });
    if (submission.verificationStatus !== "VERIFIED") {
      return reply.status(400).send({ error: "Submission must be VERIFIED to settle" });
    }
    if (submission.txHash) {
      return reply.send({ alreadySettled: true, txHash: submission.txHash });
    }

    try {
      const txHash = await settleOnChain(submission);
      if (txHash) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: { verificationStatus: "PAID", txHash },
        });
        return reply.send({ success: true, txHash });
      }
      return reply.send({ success: true, txHash: null, demoMode: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Settlement failed";
      return reply.status(500).send({ error: message });
    }
  });
}
