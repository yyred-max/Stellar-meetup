import { useState } from "react";
import { kit } from "../lib/wallet";
import { Server } from "@stellar/stellar-sdk/rpc";

const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new Server(RPC_URL);

interface WalletConnectProps {
  onConnected: (address: string) => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function checkBalance(publicKey: string): Promise<boolean> {
    try {
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
    setErrorMsg(null);
    setLoading(true);

    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id);
            const { address: publicKey } = await kit.getAddress();

            if (!publicKey) {
              setErrorMsg(
                "Wallet tidak ditemukan. Pastikan extension wallet sudah terinstall."
              );
              setLoading(false);
              return;
            }

            const hasEnoughBalance = await checkBalance(publicKey);
            if (!hasEnoughBalance) {
              setErrorMsg(
                "Saldo XLM tidak cukup. Top-up via Friendbot terlebih dahulu."
              );
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
      setErrorMsg("Koneksi ditolak. Coba lagi jika mau.");
    } else if (msg.includes("not found") || msg.includes("not installed")) {
      setErrorMsg("Wallet tidak ditemukan. Pastikan extension sudah terinstall.");
    } else {
      setErrorMsg("Terjadi kesalahan. Coba lagi.");
    }
  }

  function handleDisconnect() {
    setAddress(null);
    setErrorMsg(null);
    onConnected(""); // memberitahu App bahwa wallet terputus
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

      {/* ✅ Error message kecil, bukan banner besar */}
      {errorMsg && <p className="wallet-error-text">⚠️ {errorMsg}</p>}
    </div>
  );
}