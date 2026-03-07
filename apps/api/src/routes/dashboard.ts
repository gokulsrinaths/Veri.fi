import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/summary", async (req, reply) => {
    const wallet = (req as any).headers["x-wallet-address"] as string | undefined;
    if (!wallet) {
      return reply.send({
        createdTasks: [],
        submissions: [],
        verifiedActions: [],
        stats: { created: 0, submitted: 0, verified: 0 },
      });
    }

    const user = await prisma.user.findFirst({
      where: { walletAddress: wallet },
    });
    if (!user) {
      return reply.send({
        createdTasks: [],
        submissions: [],
        verifiedActions: [],
        stats: { created: 0, submitted: 0, verified: 0 },
      });
    }

    const [createdTasks, submissions, verifiedActions] = await Promise.all([
      prisma.task.findMany({
        where: { sponsorId: user.id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { submissions: true } } },
      }),
      prisma.submission.findMany({
        where: { participantId: user.id },
        orderBy: { createdAt: "desc" },
        include: { task: true },
      }),
      prisma.submission.findMany({
        where: { participantId: user.id, verificationStatus: "VERIFIED" },
        orderBy: { createdAt: "desc" },
        include: { task: true },
      }),
    ]);

    return reply.send({
      createdTasks,
      submissions,
      verifiedActions,
      stats: {
        created: createdTasks.length,
        submitted: submissions.length,
        verified: verifiedActions.length,
      },
    });
  });
}
