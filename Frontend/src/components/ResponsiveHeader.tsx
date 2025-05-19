// 📁 src/components/ResponsiveHeader.tsx
import React, { useState } from "react";
import { FaUser, FaBook, FaImages, FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/conversia-lg.png";
import { useWallet } from "@suiet/wallet-kit";

interface ResponsiveHeaderProps {
  setModelUrl: (url: string) => void;
  setBackgroundUrl: (url: string) => void;
  setModelId: (id: number) => void;
  userId: number;
  setShowProfile: (val: boolean) => void;
  setShowAvatar: (val: boolean) => void;
  setShowBackground: (val: boolean) => void;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  setShowProfile,
  setShowAvatar,
  setShowBackground,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const wallet = useWallet();

  return (
    <>
      {/* Logo and Hamburger */}
      <div className="flex justify-between items-center p-4 md:hidden">
        <img src={logo} alt="Conversia Logo" className="h-10" />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-2xl"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Hamburger Menu Modal */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center space-y-6 text-white text-lg">
          <button
            onClick={() => {
              setShowProfile(true);
              setMenuOpen(false);
            }}
          >
            <FaBook className="inline mr-2" /> Profile
          </button>
          <button
            onClick={() => {
              setShowBackground(true);
              setMenuOpen(false);
            }}
          >
            <FaImages className="inline mr-2" /> Background
          </button>
          <button
            onClick={() => {
              setShowAvatar(true);
              setMenuOpen(false);
            }}
          >
            <FaUser className="inline mr-2" /> Avatar
          </button>
          {wallet.status === "connected" && (
            <button onClick={wallet.disconnect} className="text-red-400">
              ❌ Disconnect
            </button>
          )}
          <button
            className="text-sm text-gray-400 underline mt-4"
            onClick={() => setMenuOpen(false)}
          >
            Close Menu
          </button>
        </div>
      )}
    </>
  );
};

export default ResponsiveHeader;
