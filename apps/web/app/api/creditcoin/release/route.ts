import { NextResponse } from "next/server";
import { ethers } from "ethers";

const VERIACT_ESCROW_ABI = [
  "function verifyTask(uint256 taskId, address worker) external",
] as const;

export async function POST(request: Request) {
  const privateKey = process.env.VERIFIER_PRIVATE_KEY;
  const contractAddress = process.env.NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS;
  const rpc = process.env.NEXT_PUBLIC_CREDITCOIN_RPC || "https://rpc.testnet.creditcoin.network";

  if (!privateKey || !contractAddress) {
    return NextResponse.json(
      { error: "Verifier or contract not configured (VERIFIER_PRIVATE_KEY, NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS)" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { onchainTaskId, workerAddress } = body as { onchainTaskId?: number; workerAddress?: string };
    if (onchainTaskId == null || !workerAddress || !ethers.isAddress(workerAddress)) {
      return NextResponse.json(
        { error: "Missing or invalid onchainTaskId or workerAddress" },
        { status: 400 }
      );
    }

    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, VERIACT_ESCROW_ABI, wallet);
    const tx = await contract.verifyTask(onchainTaskId, workerAddress);
    const receipt = await tx.wait();
    if (!receipt) {
      return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true, txHash: receipt.hash });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Release failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
