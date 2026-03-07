import type { FastifyInstance } from "fastify";
import { taskRoutes } from "./tasks.js";
import { submissionRoutes } from "./submissions.js";
import { verifyRoutes } from "./verify.js";
import { settleRoutes } from "./settle.js";
import { dashboardRoutes } from "./dashboard.js";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ ok: true }));
  app.register(taskRoutes, { prefix: "/tasks" });
  app.register(submissionRoutes, { prefix: "/submissions" });
  app.register(verifyRoutes, { prefix: "/verify" });
  app.register(settleRoutes, { prefix: "/settle" });
  app.register(dashboardRoutes, { prefix: "/dashboard" });
}
