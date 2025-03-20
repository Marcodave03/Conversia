import React, { useState } from "react";
import { FaUser, FaBook, FaImages } from "react-icons/fa";
import About from "./About";
import Memory from "./Memory";
import Profile from "./Profile";
import "../styling/Header.css";

const Header: React.FC = () => {
  const [showAbout, setShowAbout] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      {/* Header with rounded corners and glass effect */}
      <header
        className="h-24 px-12 flex items-center justify-center shadow-md rounded-full"
        style={{
          backgroundColor: "rgba(236, 235, 235, 0.17)",
          backdropFilter: "blur(30px)",
          position: "absolute",
          top: "3rem",
          left: "50%",        
          transform: "translateX(-50%)",
          width: "fit-content",
          zIndex: 50,
        }}
      >
        <nav className="flex gap-8 text-3xl text-white">

          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center hover:opacity-80 cursor-pointer"
          >
            <FaBook className="mr-2 text-teal-400 text-4xl" /> Activities
          </button>

          <button
            onClick={() => setShowMemory(true)}
            className="flex items-center hover:opacity-80 cursor-pointer"
          >
            <FaImages className="mr-2 text-blue-400 text-4xl" /> Memory
          </button>

          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center hover:opacity-80 cursor-pointer"
          >
            <FaUser className="mr-2 text-yellow-400 text-4xl" /> Profile
          </button>
        </nav>
      </header>

      {/* Popup Components */}
      {showAbout && <About onClose={() => setShowAbout(false)} />}
      {showMemory && <Memory onClose={() => setShowMemory(false)} />}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Header;
