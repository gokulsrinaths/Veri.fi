"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "veriact_wallet";

type WalletContextValue = {
  address: string | null;
  setAddress: (address: string | null) => void;
  isConnected: boolean;
  hasHydrated: boolean;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    return {
      address: null,
      setAddress: () => {},
      isConnected: false,
      hasHydrated: true,
    };
  }
  return ctx;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddressState] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.ethereum
      ? localStorage.getItem(STORAGE_KEY)
      : null;
    if (stored) setAddressState(stored);
    setHasHydrated(true);
  }, []);

  const setAddress = useCallback((value: string | null) => {
    setAddressState(value);
    if (typeof window === "undefined") return;
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        setAddress,
        isConnected: !!address,
        hasHydrated,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
