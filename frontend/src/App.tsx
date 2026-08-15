import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import PayShare from "./components/PayShare";

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <div>
      <h1>SplitBill</h1>
      <p>Stellar Soroban SplitBill</p>

      <WalletConnect onConnected={(addr) => setWalletAddress(addr)} />

      {walletAddress && (
        <>
          <p>Wallet terhubung: {walletAddress}</p>
          <PayShare walletAddress={walletAddress} />
        </>
      )}
    </div>
  );
}

export default App;