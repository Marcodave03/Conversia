import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

type NFT = {
  objectId: string;
  name: string;
  image_url: string;
  metadata_url: string;
  seller: string;
};

type MarketProps = {
  onClose: () => void;
};

const NFTMarketplace: React.FC<MarketProps> = ({ onClose }) => {
  const [marketItems, setMarketItems] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        // You would replace this with your backend API call or query to smart contract
        const mockMarketItems: NFT[] = [
          {
            objectId: "0x123abc...",
            name: "Cyber Avatar",
            image_url:
              "https://orange-wonderful-galliform-478.mypinata.cloud/ipfs/bafybeidjilk7l73e7teq4tr44jtkn5rs4metzmha5y3ggnwomytcuyqw6u",
            metadata_url:
              "https://orange-wonderful-galliform-478.mypinata.cloud/ipfs/bafybeidjilk7l73e7teq4tr44jtkn5rs4metzmha5y3ggnwomytcuyqw6u",
            seller: "0xDevAddressHere"
          },
          {
            objectId: "0x456def...",
            name: "Neo Avatar",
            image_url: "https://example.com/ipfs/avatar2",
            metadata_url: "https://example.com/ipfs/avatar2",
            seller: "0xUserAddressHere"
          }
        ];

        setMarketItems(mockMarketItems);
      } catch (error) {
        console.error("❌ Failed to fetch market items:", error);
      }
    };

    fetchMarket();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={24} />
        </button>
        <h2 className="text-2xl font-bold text-center mt-6">Marketplace</h2>

        {marketItems.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No items listed for sale.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
            {marketItems.map((nft) => (
              <div
                key={nft.objectId}
                className="bg-gray-100 rounded-xl shadow-md p-4"
              >
                <img
                  src={nft.image_url}
                  alt={nft.name}
                  className="w-full h-64 object-cover rounded-lg mb-2"
                />
                <h3 className="text-lg font-medium">{nft.name}</h3>
                <p className="text-sm text-gray-600">Seller: {nft.seller}</p>
                <a
                  href={nft.metadata_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 underline"
                >
                  View Metadata
                </a>
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                  Buy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMarketplace;
