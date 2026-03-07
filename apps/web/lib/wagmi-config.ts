import { http, createConfig } from "wagmi";
import { hardhat } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "11124"
  ? {
      id: 11124,
      name: "Creditcoin Testnet",
      nativeCurrency: { name: "Creditcoin", symbol: "CTC", decimals: 18 },
      rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.creditcoin.network"] } },
      blockExplorers: { default: { name: "Explorer", url: "https://explorer.creditcoin.network" } },
    }
  : hardhat;

export const config = createConfig({
  chains: [chain as typeof hardhat],
  connectors: [injected()],
  transports: {
    [chain.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"),
  },
});
