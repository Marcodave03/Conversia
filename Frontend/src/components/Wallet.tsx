import React, { useEffect } from "react";
import { useWallet, ConnectButton, addressEllipsis } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import { useNavigate } from "react-router-dom";

const Wallet: React.FC = () => {
  const wallet = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    const createUserAndRedirect = async () => {
      if (wallet.status === "connected" && wallet.account?.address) {
        try {
          // Send user info to backend
          const res = await fetch("http://localhost:5555/api/conversia/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sui_id: wallet.account.address,
              username: addressEllipsis(wallet.account.address),
            }),
          });

          const data = await res.json();
          console.log("✅ User created or already exists:", data);

          // Redirect to main app page
          navigate("/");
        } catch (error) {
          console.error("❌ Failed to create user or redirect:", error);
        }
      }
    };

    createUserAndRedirect();
  }, [wallet.status, wallet.account, navigate]);

  return (
    <div className="text-white px-4 py-2 rounded-lg z-[50]">
      <ConnectButton />
      <p>Wallet Status: {wallet.status}</p>
      {wallet.status === "connected" && (
        <>
          <p>Account: {wallet.account?.address}</p>
          <p>Ellipsis: {addressEllipsis(wallet.account?.address || "")}</p>
          <p>Chain: {wallet.chain?.name}</p>
        </>
      )}
    </div>
  );
};

export default Wallet;
