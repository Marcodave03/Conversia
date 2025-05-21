import React, { useState } from "react";
import bgImage from "../assets/landing-bg.jpg";
import logo from "../assets/conversia-lg.png";
import Wallet from "../components/Wallet";

const BYPASS_WALLET =
  "0xcdf86d8b2bee2139300484722b7563b09cfba83d6e5dc745d8f9af82a354557a";

const LandingPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="flex flex-col items-center">
        <img src={logo} alt="Conversia Logo" className="w-82 h-32 mb-6" />

        {!walletAddress ? (
          <div className="flex flex-col gap-3 items-center">
            <Wallet />
            <button
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm rounded text-white"
              onClick={() => {
                localStorage.setItem("bypassWallet", BYPASS_WALLET);
                setWalletAddress(BYPASS_WALLET); // sets local state so it shows immediately
                window.location.href = "/"; // Navigate to the main app
              }}
            >
              🔓 Bypass with Test Wallet
            </button>
          </div>
        ) : (
          <p className="text-sm bg-white/10 px-4 py-2 rounded">
            Using test wallet:
            <br />
            <code className="text-xs break-all font-mono">{walletAddress}</code>
          </p>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
