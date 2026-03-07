function env(key: string, defaultValue?: string): string {
  const v = process.env[key] ?? defaultValue;
  if (v === undefined || v === "") throw new Error(`Missing env: ${key}`);
  return v;
}

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/verifi",
  storagePath: process.env.STORAGE_PATH ?? "./uploads",
  verifierPrivateKey: process.env.VERIFIER_PRIVATE_KEY ?? "",
  rpcUrl: process.env.RPC_URL ?? "http://127.0.0.1:8545",
  chainId: parseInt(process.env.CHAIN_ID ?? "31337", 10),
  settlementAddress: process.env.SETTLEMENT_ADDRESS ?? "",
  taskRegistryAddress: process.env.TASK_REGISTRY_ADDRESS ?? "",
  escrowVaultAddress: process.env.ESCROW_VAULT_ADDRESS ?? "",
  submissionRegistryAddress: process.env.SUBMISSION_REGISTRY_ADDRESS ?? "",
  demoMode: process.env.DEMO_MODE === "true",
  visionApiKey: process.env.VISION_API_KEY ?? "",
};
