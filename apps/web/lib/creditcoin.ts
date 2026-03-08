/**
 * Creditcoin testnet integration for VeriAct escrow.
 * Uses ethers v6 + MetaMask (BrowserProvider).
 */

import { Contract, BrowserProvider, formatEther, parseEther } from "ethers";

const CREDITCOIN_CHAIN_ID = 102031;
const CREDITCOIN_RPC = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_CREDITCOIN_RPC || "https://rpc.testnet.creditcoin.network")
  : "";

const VERIACT_ESCROW_ABI = [
  "function createTask() payable returns (uint256 taskId)",
  "function verifyTask(uint256 taskId, address worker) external",
  "function getTask(uint256 taskId) view returns (address sponsor, uint256 reward, bool completed)",
  "function nextTaskId() view returns (uint256)",
  "event TaskCreated(uint256 indexed taskId, address indexed sponsor, uint256 reward)",
  "event TaskVerified(uint256 indexed taskId, address indexed worker, uint256 reward)",
] as const;

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}

export async function connectWallet(): Promise<{ address: string; provider: BrowserProvider }> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const address = accounts[0];
  if (!address) throw new Error("No account connected");
  return { address, provider };
}

export async function ensureCreditcoinNetwork(provider: BrowserProvider): Promise<void> {
  const network = await provider.getNetwork();
  if (Number(network.chainId) === CREDITCOIN_CHAIN_ID) return;
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: `0x${CREDITCOIN_CHAIN_ID.toString(16)}` }]);
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err.code === 4902) {
      await provider.send("wallet_addEthereumChain", [
        {
          chainId: `0x${CREDITCOIN_CHAIN_ID.toString(16)}`,
          chainName: "Creditcoin Testnet",
          nativeCurrency: { name: "Creditcoin", symbol: "CTC", decimals: 18 },
          rpcUrls: [process.env.NEXT_PUBLIC_CREDITCOIN_RPC || "https://rpc.testnet.creditcoin.network"],
        },
      ]);
    } else {
      throw e;
    }
  }
}

function getContractAddress(): string {
  const addr = process.env.NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS;
  if (!addr) throw new Error("NEXT_PUBLIC_VERIACT_ESCROW_ADDRESS not set");
  return addr;
}

export async function createTaskOnChain(rewardWei: bigint): Promise<{ taskId: number; txHash: string }> {
  const { provider } = await connectWallet();
  await ensureCreditcoinNetwork(provider);
  const signer = await provider.getSigner();
  const contractAddress = getContractAddress();
  const contract = new Contract(contractAddress, VERIACT_ESCROW_ABI, signer);
  const taskIdBefore = await contract.nextTaskId();
  const tx = await contract.createTask({ value: rewardWei });
  const receipt = await tx.wait();
  if (!receipt) throw new Error("Transaction failed");
  const taskId = Number(taskIdBefore);
  return { taskId, txHash: receipt.hash };
}

export async function getTaskOnChain(taskId: number): Promise<{ sponsor: string; reward: string; completed: boolean }> {
  if (typeof window === "undefined") {
    const { JsonRpcProvider } = await import("ethers");
    const rpc = process.env.NEXT_PUBLIC_CREDITCOIN_RPC || "https://rpc.testnet.creditcoin.network";
    const provider = new JsonRpcProvider(rpc);
    const contractAddress = getContractAddress();
    const contract = new Contract(contractAddress, VERIACT_ESCROW_ABI, provider);
    const [sponsor, reward, completed] = await contract.getTask(taskId);
    return { sponsor, reward: formatEther(reward), completed };
  }
  const { provider } = await connectWallet();
  const contractAddress = getContractAddress();
  const contract = new Contract(contractAddress, VERIACT_ESCROW_ABI, provider);
  const [sponsor, reward, completed] = await contract.getTask(taskId);
  return { sponsor, reward: formatEther(reward), completed };
}

export async function getBalance(address: string): Promise<string> {
  const rpc = process.env.NEXT_PUBLIC_CREDITCOIN_RPC || "https://rpc.testnet.creditcoin.network";
  if (typeof window !== "undefined") {
    try {
      const { JsonRpcProvider } = await import("ethers");
      const provider = new JsonRpcProvider(rpc);
      const balance = await provider.getBalance(address);
      return formatEther(balance);
    } catch {
      return "0";
    }
  }
  const { JsonRpcProvider } = await import("ethers");
  const provider = new JsonRpcProvider(rpc);
  const balance = await provider.getBalance(address);
  return formatEther(balance);
}

export function parseRewardToWei(rewardAmount: string): bigint {
  const num = parseFloat(rewardAmount.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(num) || num < 0) return BigInt(0);
  return parseEther(num.toString());
}
