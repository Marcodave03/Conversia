import React, { useState, useEffect } from "react";
import { FaUser, FaBook, FaImages } from "react-icons/fa";
import { IoIosWater } from "react-icons/io";
import About from "./Background";
import Profile from "./Profile";
import AvatarPick from "./AvatarPick";
import NFTGallery from "./NftMarket";
import logo from "../assets/conversia-lg.png";
import { useWallet } from "@suiet/wallet-kit";
import { useNavigate } from "react-router-dom";
import ResponsiveHeader from "./ResponsiveHeader";

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
  const [showNft, setShowNft] = useState(false);
  const wallet = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet.status === "disconnected") {
      navigate("/landing");
    }
  }, [wallet.status, navigate]);

  return (
    <>
      {/* Desktop Navbar (Logo on Left, Menu Centered, Button Right) */}
      <div className="hidden md:flex fixed top-6 left-4 right-4 z-50 items-center justify-between">
        {/* Logo (Left) */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full shadow-md px-4 py-2">
          <img
            src={logo}
            alt="Conversia Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Menu (Center) */}
        <div className="flex gap-8 text-white text-xl font-semibold bg-white/10 backdrop-blur-xl rounded-full shadow-lg px-8 py-4">
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
            <FaImages className="text-red-400 text-2xl" />
            Background
          </button>
          <button
            onClick={() => setShowAvatar(true)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <FaUser className="text-yellow-400 text-2xl" />
            Avatar
          </button>
          <button
            onClick={() => setShowNft(true)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <IoIosWater className="text-blue-200 text-2xl" />
            NFT
          </button>
        </div>

        {/* Disconnect Button (Right) */}
        {wallet.status === "connected" && (
          <button
            onClick={wallet.disconnect}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-full shadow-lg transition"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Mobile Nav */}
      <div className="block md:hidden">
        <ResponsiveHeader
          setModelUrl={setModelUrl}
          setModelId={setModelId}
          setBackgroundUrl={setBackgroundUrl}
          userId={userId}
          setShowAvatar={setShowAvatar}
          setShowBackground={setShowBackground}
          setShowProfile={setShowProfile}
          setShowNft={setShowNft}
        />
      </div>

      {/* Popups */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showBackground && (
        <About
          onClose={() => setShowBackground(false)}
          onSelectBackground={(url) => setBackgroundUrl(url)}
        />
      )}
      {showAvatar && (
        <AvatarPick
          userId={userId}
          onClose={() => setShowAvatar(false)}
          onSelectAvatar={(modelUrl, modelId) => {
            setModelUrl(modelUrl);
            setModelId(modelId);
          }}
        />
      )}
      {showNft && <NFTGallery onClose={() => setShowNft(false)} />}
    </>
  );
};

export default Header;
