"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, formatEther } from "ethers";

const CREDITCOIN_CHAIN_ID = 102031;
const CREDITCOIN_CHAIN_ID_HEX = `0x${CREDITCOIN_CHAIN_ID.toString(16)}`;
const CREDITCOIN_RPC =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_CREDITCOIN_RPC ||
        "https://rpc.testnet.creditcoin.network")
    : "";

export function CreditcoinCheck() {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [error, setError] = useState("");
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const fetchBalance = async (provider, walletAddress) => {
    const bal = await provider.getBalance(walletAddress);
    return formatEther(bal);
  };

  const connectWallet = async () => {
    setLoading(true);
    setError("");
    setAddress("");
    setChainId("");
    setBalance("");
    setWrongNetwork(false);

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const walletAddress = accounts[0];

      if (!walletAddress) {
        throw new Error("No account connected");
      }

      const network = await provider.getNetwork();
      const currentChainId = network.chainId.toString();

      setAddress(walletAddress);
      setChainId(currentChainId);

      const isCreditcoinTestnet =
        Number(network.chainId) === CREDITCOIN_CHAIN_ID;

      if (!isCreditcoinTestnet) {
        setWrongNetwork(true);
        setBalance("—");
        return;
      }

      const ctcBalance = await fetchBalance(provider, walletAddress);
      setBalance(ctcBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const switchToCreditcoinTestnet = async () => {
    setSwitchLoading(true);
    setError("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CREDITCOIN_CHAIN_ID_HEX }],
        });
      } catch (switchErr) {
        const isChainNotAdded = switchErr.code === 4902 || switchErr.code === "4902";
        if (isChainNotAdded) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: CREDITCOIN_CHAIN_ID_HEX,
                chainName: "Creditcoin Testnet",
                rpcUrls: [CREDITCOIN_RPC],
                nativeCurrency: {
                  name: "Creditcoin",
                  symbol: "CTC",
                  decimals: 18,
                },
              },
            ],
          });
        } else {
          throw switchErr;
        }
      }

      setWrongNetwork(false);
      const provider = new BrowserProvider(window.ethereum);
      const ctcBalance = await fetchBalance(provider, address);
      setBalance(ctcBalance);
      setChainId(CREDITCOIN_CHAIN_ID.toString());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to switch network"
      );
    } finally {
      setSwitchLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum || !address) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts.length) {
        setAddress("");
        setChainId("");
        setBalance("");
        setWrongNetwork(false);
      }
    };

    const handleChainChanged = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const currentChainId = network.chainId.toString();
        setChainId(currentChainId);

        const isCreditcoinTestnet =
          Number(network.chainId) === CREDITCOIN_CHAIN_ID;
        setWrongNetwork(!isCreditcoinTestnet);

        if (isCreditcoinTestnet) {
          const ctcBalance = await fetchBalance(provider, address);
          setBalance(ctcBalance);
        } else {
          setBalance("—");
        }
      } catch {
        setBalance("—");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [address]);

  const hasBalance = balance !== "" && balance !== "—" && Number(balance) > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-md">
      <h2 className="text-lg font-semibold text-foreground">
        Creditcoin Testnet Check
      </h2>

      {!address ? (
        <>
          <button
            type="button"
            onClick={connectWallet}
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Connecting…" : "Connect Wallet"}
          </button>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </>
      ) : (
        <div className="space-y-3 text-sm">
          {wrongNetwork && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
              <p className="text-amber-200 font-medium">
                Wrong network. Please switch to Creditcoin Testnet.
              </p>
              <button
                type="button"
                onClick={switchToCreditcoinTestnet}
                disabled={switchLoading}
                className="w-full py-2 px-4 rounded-lg bg-amber-500/20 text-amber-200 font-medium hover:bg-amber-500/30 disabled:opacity-50 transition-colors"
              >
                {switchLoading ? "Switching…" : "Switch to Creditcoin Testnet"}
              </button>
            </div>
          )}

          <p>
            <span className="text-muted-foreground">Wallet address:</span>{" "}
            <span className="font-mono text-foreground break-all">
              {address}
            </span>
          </p>
          <p>
            <span className="text-muted-foreground">Network chain ID:</span>{" "}
            <span className="font-mono text-foreground">{chainId}</span>
          </p>
          <p>
            <span className="text-muted-foreground">CTC balance:</span>{" "}
            <span className="font-mono text-foreground">{balance} CTC</span>
          </p>

          {!wrongNetwork && (
            <p
              className={`pt-2 font-medium ${
                hasBalance ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {hasBalance
                ? "CTC testnet tokens detected"
                : "No CTC tokens found in this wallet"}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive pt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
