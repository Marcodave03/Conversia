import React from "react";
import { FaHome, FaUser, FaBook, FaImages } from "react-icons/fa"; // Icons
import logo from "../assets/conversia-lg.png"; 

const Header: React.FC = () => {
  return (
    <header
      className="w-full h-24 flex items-center justify-center shadow-md relative"
      style={{ backgroundColor: "#1b86ea" }}
    >
      {/* Logo Section (Positioned Absolutely for Centering Flexibility) */}
      <img 
        src={logo} 
        alt="Logo" 
        className="h-20 w-auto absolute left-6" 
      />

      {/* Navigation Buttons (Centered) */}
      <nav className="flex gap-10">
        <button className="flex items-center text-white text-lg hover:opacity-80">
          <FaHome className="mr-2" /> Home
        </button>

        <button className="flex items-center text-white text-lg hover:opacity-80">
          <FaBook className="mr-2" /> About
        </button>

        <button className="flex items-center text-white text-lg hover:opacity-80">
          <FaImages className="mr-2" /> Memory
        </button>

        <button className="flex items-center text-white text-lg hover:opacity-80">
          <FaUser className="mr-2" /> Profile
        </button>
      </nav>
    </header>
  );
};

export default Header;
