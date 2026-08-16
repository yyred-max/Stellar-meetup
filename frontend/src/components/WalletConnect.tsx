// WalletConnect.tsx
import { useState } from "react";
import { kit } from "../lib/wallet";
import { Server } from "@stellar/stellar-sdk/rpc";

const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new Server(RPC_URL);

type WalletError = {
  type: "not_found" | "rejected" | "insufficient_balance" | "unknown";
  message: string;
};

interface WalletConnectProps {
  onConnected: (address: string) => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<WalletError | null>(null);
  const [loading, setLoading] = useState(false);

  async function checkBalance(publicKey: string): Promise<boolean> {
    try {
      // ✅ Cast ke any agar TypeScript tidak protes
      const account = (await server.getAccount(publicKey)) as any;
      const nativeBalance = account.balances?.find(
        (b: any) => b.asset_type === "native"
      );
      const balance = nativeBalance ? parseFloat(nativeBalance.balance) : 0;
      return balance >= 2;
    } catch {
      return false;
    }
  }

  async function handleConnect() {
    setError(null);
    setLoading(true);

    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id);

            const { address: publicKey } = await kit.getAddress();

            if (!publicKey) {
              setError({
                type: "not_found",
                message:
                  "Wallet tidak ditemukan. Pastikan kamu sudah install extension wallet (contoh: Freighter) dan sudah login.",
              });
              setLoading(false);
              return;
            }

            const hasEnoughBalance = await checkBalance(publicKey);
            if (!hasEnoughBalance) {
              setError({
                type: "insufficient_balance",
                message:
                  "Saldo XLM kamu tidak cukup untuk melakukan transaksi di testnet. Silakan top-up lewat Friendbot.",
              });
              setLoading(false);
              return;
            }

            setAddress(publicKey);
            onConnected(publicKey);
          } catch (err: any) {
            handleError(err);
          } finally {
            setLoading(false);
          }
        },
        onClosed: () => {
          setLoading(false);
        },
      });
    } catch (err: any) {
      handleError(err);
      setLoading(false);
    }
  }

  function handleError(err: any) {
    const msg = String(err?.message || err || "").toLowerCase();

    if (msg.includes("reject") || msg.includes("declined") || msg.includes("cancel")) {
      setError({
        type: "rejected",
        message: "Kamu menolak permintaan koneksi wallet. Coba lagi kalau mau lanjut.",
      });
    } else if (msg.includes("not found") || msg.includes("not installed")) {
      setError({
        type: "not_found",
        message: "Wallet tidak ditemukan. Pastikan extension wallet sudah terinstall.",
      });
    } else {
      setError({
        type: "unknown",
        message: "Terjadi kesalahan saat menghubungkan wallet. Silakan coba lagi.",
      });
    }
  }

  function handleDisconnect() {
    setAddress(null);
    setError(null);
  }

  return (
    <div className="wallet-connect">
      {!address ? (
        <button onClick={handleConnect} disabled={loading}>
          {loading ? "Menghubungkan..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="wallet-info">
          <span>
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}

      {error && (
        <div className={`wallet-error wallet-error--${error.type}`}>
          ⚠️ {error.message}
        </div>
      )}
    </div>
  );
}
