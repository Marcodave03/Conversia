import React from "react";

interface AboutProps {
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[50%]">
        <h2 className="text-3xl font-bold mb-4">About Us</h2>
        <p>
          Welcome to Conversia! This app is designed to bring immersive
          conversation experiences through AI-powered avatars.
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default About;
