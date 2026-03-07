/**
 * Chain and app constants
 */

export const CREDITCOIN_TESTNET = {
  chainId: 11124,
  name: "Creditcoin Testnet",
  rpcUrls: ["https://rpc.creditcoin.network"],
  blockExplorerUrls: ["https://explorer.creditcoin.network"],
  nativeCurrency: {
    name: "Creditcoin",
    symbol: "CTC",
    decimals: 18,
  },
} as const;

export const APP_NAME = "veri.fi";
export const APP_TAGLINE = "AI-verified proof of real-world actions on Creditcoin";

export const TASK_CATEGORIES = [
  "DePIN",
  "RWA",
  "Retail",
  "Logistics",
  "Event",
  "Field Ops",
] as const;

export const PROOF_TYPES = ["PHOTO", "VIDEO"] as const;

export const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  PAID: "Paid",
  DRAFT: "Draft",
  CLOSED: "Closed",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  VERIFYING: "Verifying",
};
