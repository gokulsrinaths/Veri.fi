import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending } = useConnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/70 font-mono truncate max-w-[140px]">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="text-xs text-white/50 hover:text-white"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const injected = connectors.find((c) => c.id === "injected" || c.id === "metaMask");
  return (
    <button
      type="button"
      onClick={() => connect({ connector: injected || connectors[0] })}
      disabled={isPending}
      className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50"
    >
      {isPending ? "Connecting..." : "Connect wallet"}
    </button>
  );
}
