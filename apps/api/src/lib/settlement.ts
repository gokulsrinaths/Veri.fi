import { createWalletClient, http, parseEther, type Hash } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import { config } from "../config.js";

const SETTLEMENT_ABI = [
  {
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "submissionId", type: "bytes32" },
      { name: "score", type: "uint256" },
      { name: "thresholdBps", type: "uint256" },
    ],
    name: "resolveAndSettle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "submissionId", type: "bytes32" },
      { name: "taskId", type: "bytes32" },
      { name: "participant", type: "address" },
      { name: "evidenceHash", type: "bytes32" },
    ],
    name: "recordSubmission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

type SubmissionWithTaskAndParticipant = {
  id: string;
  taskId: string;
  evidenceHash: string | null;
  verificationScore: number | null;
  task: { confidenceThreshold: number; onchainTaskId: string | null };
  participant: { walletAddress: string };
};

function toBytes32(s: string): Hash {
  const h = "0x" + Buffer.from(s.replace(/-/g, "").slice(0, 32).padEnd(64, "0")).toString("hex");
  return h as Hash;
}

export async function settleOnChain(
  submission: SubmissionWithTaskAndParticipant
): Promise<string | null> {
  if (!config.verifierPrivateKey || !config.settlementAddress) {
    return null;
  }
  const account = privateKeyToAccount(
    config.verifierPrivateKey.startsWith("0x")
      ? (config.verifierPrivateKey as `0x${string}`)
      : (`0x${config.verifierPrivateKey}` as `0x${string}`)
  );
  const client = createWalletClient({
    account,
    chain: hardhat,
    transport: http(config.rpcUrl),
  });
  const taskIdOnChain = submission.task.onchainTaskId || toBytes32(submission.taskId);
  const submissionIdOnChain = toBytes32(submission.id);
  const evidenceHash =
    submission.evidenceHash?.startsWith("0x") ?
      (submission.evidenceHash as Hash)
    : (`0x${submission.evidenceHash}` as Hash);
  const scoreBps = Math.round((submission.verificationScore ?? 0) * 10000);
  const thresholdBps = Math.round(submission.task.confidenceThreshold * 10000);

  const hash = await client.writeContract({
    address: config.settlementAddress as `0x${string}`,
    abi: SETTLEMENT_ABI,
    functionName: "resolveAndSettle",
    args: [taskIdOnChain, submissionIdOnChain, BigInt(scoreBps), BigInt(thresholdBps)],
  });
  return hash;
}
