import React from "react";

interface MemoryProps {
  onClose: () => void;
}

const Memory: React.FC<MemoryProps> = ({ onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[50%]">
        <h2 className="text-3xl font-bold mb-4">Memory</h2>
        <p>Here are some of your cherished moments and interactions.</p>
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

export default Memory;
