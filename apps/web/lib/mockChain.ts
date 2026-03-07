/**
 * Mock blockchain layer for hackathon demo.
 * Replace with real Creditcoin / EVM integration later.
 */

export interface ReleaseRewardResult {
  success: boolean;
  txHash: string;
}

export function releaseReward(
  _taskId: string,
  _submissionId: string,
  _rewardAmount: string
): ReleaseRewardResult {
  const hex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join("");
  return {
    success: true,
    txHash: "0x" + hex,
  };
}
