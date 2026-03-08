/**
 * Server-only: release reward on Creditcoin via verifier wallet.
 * Used by contractService when settling verified submissions.
 */

import { ethers } from "ethers";

const VERIACT_ESCROW_ABI = [
  "function verifyTask(uint256 taskId, address worker) external",
] as const;

export async function releaseOnChain(
  onchainTaskId: number,
  workerAddress: string
): Promise<{ success: boolean; txHash?: string }> {
  const privateKey = process.env.VERIFIER_PRIVATE_KEY;
  const contractAddress = process.env.NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS;
  const rpc = process.env.NEXT_PUBLIC_CREDITCOIN_RPC || "https://rpc.testnet.creditcoin.network";

  if (!privateKey || !contractAddress) {
    return { success: false };
  }
  if (!ethers.isAddress(workerAddress)) {
    return { success: false };
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, VERIACT_ESCROW_ABI, wallet);
  const tx = await contract.verifyTask(onchainTaskId, workerAddress);
  const receipt = await tx.wait();
  return { success: !!receipt, txHash: receipt?.hash };
}
