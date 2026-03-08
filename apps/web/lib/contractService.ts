/**
 * Contract service — Creditcoin escrow + fallback when on-chain is unavailable.
 */

import { releaseReward } from "./mockChain";
import { releaseOnChain } from "./creditcoin-release-server";

export interface SettlementResult {
  success: boolean;
  txHash?: string;
}

export async function settleReward(
  taskId: string,
  submissionId: string,
  rewardAmount: string,
  options?: { onchainTaskId?: number; participantAddress?: string }
): Promise<SettlementResult> {
  const { onchainTaskId, participantAddress } = options ?? {};
  if (onchainTaskId != null && participantAddress) {
    try {
      const result = await releaseOnChain(onchainTaskId, participantAddress);
      if (result.success && result.txHash) {
        return { success: true, txHash: result.txHash };
      }
    } catch (e) {
      console.warn("On-chain release failed, using fallback:", e);
    }
  }
  const result = releaseReward(taskId, submissionId, rewardAmount);
  return { success: result.success, txHash: result.txHash };
}
