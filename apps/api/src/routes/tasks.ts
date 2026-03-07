import type { FastifyInstance } from "fastify";
import { createTaskSchema } from "@verifi/shared";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const querySchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export async function taskRoutes(app: FastifyInstance) {
  app.post("/", async (req, reply) => {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const body = parsed.data;
    const sponsorWallet =
      (req as any).headers["x-wallet-address"] ??
      (req.body as any).walletAddress ??
      "0x0000000000000000000000000000000000000001";

    let sponsor = await prisma.user.findFirst({
      where: { walletAddress: sponsorWallet },
    });
    if (!sponsor) {
      sponsor = await prisma.user.create({
        data: {
          walletAddress: sponsorWallet,
          role: "SPONSOR",
        },
      });
    }

    const weights = body.scoringWeights ?? {
      location: 0.3,
      time: 0.15,
      visual: 0.3,
      liveness: 0.1,
      antiFraud: 0.15,
    };

    const task = await prisma.task.create({
      data: {
        sponsorId: sponsor.id,
        title: body.title,
        description: body.description,
        category: body.category,
        targetLatitude: body.targetLatitude,
        targetLongitude: body.targetLongitude,
        radiusMeters: body.radiusMeters,
        requiredProofType: body.requiredProofType,
        expectedObjectLabel: body.expectedObjectLabel,
        rewardAmount: body.rewardAmount,
        rewardToken: body.rewardToken,
        confidenceThreshold: body.confidenceThreshold,
        maxSubmissions: body.maxSubmissions,
        status: "OPEN",
        scoringWeightsJson: weights as object,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
      include: { sponsor: true },
    });
    return reply.status(201).send(task);
  });

  app.get("/", async (req, reply) => {
    const q = querySchema.safeParse(req.query);
    if (!q.success) return reply.status(400).send({ error: q.error.flatten() });
    const { category, status, limit, offset } = q.data;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;
    else where.status = "OPEN";

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: { sponsor: true },
      }),
      prisma.task.count({ where }),
    ]);
    return reply.send({ tasks, total });
  });

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { sponsor: true, submissions: true },
    });
    if (!task) return reply.status(404).send({ error: "Task not found" });
    return reply.send(task);
  });
}
