import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { registerRoutes } from "./routes/index.js";
import { prisma } from "./lib/prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(process.cwd(), config.storagePath);

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
});

await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });
await app.register(fastifyStatic, {
  root: uploadsDir,
  prefix: "/uploads/",
});

await registerRoutes(app);

const start = async () => {
  try {
    await prisma.$connect();
    await app.listen({ port: config.port, host: "0.0.0.0" });
    console.log(`API running at http://localhost:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
