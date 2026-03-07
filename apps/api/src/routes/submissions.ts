import type { FastifyInstance } from "fastify";
import { createSubmissionSchema } from "@verifi/shared";
import { prisma } from "../lib/prisma.js";
import { createHash } from "crypto";
import { config } from "../config.js";
import fs from "fs/promises";
import path from "path";

export async function submissionRoutes(app: FastifyInstance) {
  app.post("/upload", async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.status(400).send({ error: "No file" });
    const taskId = (req as any).query?.taskId || (data.fields as any)?.taskId?.value;
    if (!taskId) return reply.status(400).send({ error: "taskId required" });
    const dir = path.join(config.storagePath, String(taskId));
    await fs.mkdir(dir, { recursive: true });
    const ext = path.extname(data.filename) || ".bin";
    const localName = `${Date.now()}-${createHash("sha256").update(String(taskId) + Date.now()).digest("hex").slice(0, 12)}${ext}`;
    const localPath = path.join(dir, localName);
    const buf = await data.toBuffer();
    await fs.writeFile(localPath, buf);
    const mediaUrl = `/uploads/${taskId}/${localName}`;
    return reply.send({ mediaUrl });
  });

  app.post("/presign", async (req, reply) => {
    const body = req.body as { taskId: string; filename: string; contentType: string };
    if (!body.taskId || !body.filename) {
      return reply.status(400).send({ error: "taskId and filename required" });
    }
    const task = await prisma.task.findUnique({ where: { id: body.taskId } });
    if (!task) return reply.status(404).send({ error: "Task not found" });

    const dir = path.join(config.storagePath, body.taskId);
    await fs.mkdir(dir, { recursive: true });
    const ext = path.extname(body.filename) || ".bin";
    const localName = `${Date.now()}-${createHash("sha256").update(body.taskId + Date.now()).digest("hex").slice(0, 12)}${ext}`;
    const localPath = path.join(dir, localName);
    const mediaUrl = `/uploads/${body.taskId}/${localName}`;
    return reply.send({
      uploadPath: localPath,
      mediaUrl,
      method: "multipart",
    });
  });

  app.post("/", async (req, reply) => {
    const parsed = createSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const body = parsed.data;
    const participantWallet = (req as any).headers["x-wallet-address"] as string | undefined;
    if (!participantWallet) {
      return reply.status(401).send({ error: "x-wallet-address required" });
    }

    let participant = await prisma.user.findFirst({
      where: { walletAddress: participantWallet },
    });
    if (!participant) {
      participant = await prisma.user.create({
        data: { walletAddress: participantWallet, role: "PARTICIPANT" },
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: body.taskId },
      include: { sponsor: true },
    });
    if (!task) return reply.status(404).send({ error: "Task not found" });
    if (task.status !== "OPEN") return reply.status(400).send({ error: "Task not open" });

    const evidencePayload = `${body.taskId}:${body.mediaUrl}:${body.capturedAt}:${participantWallet}`;
    const evidenceHash = createHash("sha256").update(evidencePayload).digest("hex");

    const submission = await prisma.submission.create({
      data: {
        taskId: body.taskId,
        participantId: participant.id,
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType,
        capturedLatitude: body.capturedLatitude ?? null,
        capturedLongitude: body.capturedLongitude ?? null,
        capturedAt: new Date(body.capturedAt),
        exifJson: (body.exifJson as object) ?? undefined,
        sessionToken: body.sessionToken ?? null,
        evidenceHash,
        verificationStatus: "PENDING",
      },
      include: { task: true, participant: true },
    });

    return reply.status(201).send(submission);
  });

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { task: true, participant: true, verificationResult: true },
    });
    if (!submission) return reply.status(404).send({ error: "Submission not found" });
    return reply.send(submission);
  });

  app.get<{ Params: { id: string } }>("/:id/result", async (req, reply) => {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { verificationResult: true, task: true },
    });
    if (!submission) return reply.status(404).send({ error: "Submission not found" });
    return reply.send({
      verificationStatus: submission.verificationStatus,
      verificationScore: submission.verificationScore,
      scoreBreakdownJson: submission.scoreBreakdownJson,
      txHash: submission.txHash,
    });
  });
}
