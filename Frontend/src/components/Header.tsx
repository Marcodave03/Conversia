import React, { useState, useEffect } from "react";
import { FaUser, FaBook, FaImages } from "react-icons/fa";
import About from "./Background";
import Profile from "./Profile";
import AvatarPick from "./AvatarPick";
import logo from "../assets/conversia-lg.png";
import { useWallet } from "@suiet/wallet-kit";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  setModelUrl: (url: string) => void;
  setBackgroundUrl: (url: string) => void;
  setModelId: (id: number) => void;
  userId: number;
};

const Header: React.FC<HeaderProps> = ({
  setModelUrl,
  setBackgroundUrl,
  setModelId,
  userId,
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const wallet = useWallet();
  const navigate = useNavigate();

  // Redirect to /landing if wallet is disconnected
  useEffect(() => {
    if (wallet.status === "disconnected") {
      navigate("/landing");
    }
  }, [wallet.status, navigate]);

  // Debug: show selected model URL (you can remove this in production)
  // useEffect(() => {
  //   if (modelUrl) {
  //     console.log("Selected avatar model:", modelUrl);
  //   }
  // }, [modelUrl]);

  return (
    <>
      {/* Conversia Logo */}
      <a
        href="/"
        className="fixed top-6 left-4 z-50 bg-white/10 backdrop-blur-xl rounded-full shadow-md p-2 transition hover:opacity-90"
      >
        <img
          src={logo}
          alt="Conversia Logo"
          className="h-12 w-auto object-contain"
        />
      </a>

      {/* Navigation Bar */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white bg-opacity-10 backdrop-blur-xl rounded-full shadow-lg px-8 py-4">
        <nav className="flex gap-8 text-white text-xl font-semibold items-center">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <FaBook className="text-teal-400 text-2xl" />
            Profile
          </button>

          <button
            onClick={() => setShowBackground(true)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <FaImages className="text-blue-400 text-2xl" />
            Background
          </button>

          <button
            onClick={() => setShowAvatar(true)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <FaUser className="text-yellow-400 text-2xl" />
            Avatar
          </button>
        </nav>
      </header>

      {/* Disconnect Button */}
      {wallet.status === "connected" && (
        <button
          onClick={wallet.disconnect}
          className="fixed top-6 right-4 z-50 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full shadow-lg transition"
        >
          Disconnect
        </button>
      )}

      {/* Popups */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showBackground && (
        <About
          onClose={() => setShowBackground(false)}
          onSelectBackground={(url) => setBackgroundUrl(url)} // ✅ pass back
        />
      )}
      {showAvatar && (
        // <AvatarPick
        //   userId={2}
        //   onClose={() => setShowAvatar(false)}
        //   onSelectAvatar={(modelUrl) => setModelUrl(modelUrl)}
        // />
        <AvatarPick
          userId={userId} // ✅ Use actual userId
          onClose={() => setShowAvatar(false)}
          onSelectAvatar={(modelUrl, modelId) => {
            setModelUrl(modelUrl);
            setModelId(modelId);
          }}
        />
      )}
    </>
  );
};

export default Header;
