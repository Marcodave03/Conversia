import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

type NFT = {
  objectId: string;
  name: string;
  image_url: string;
  metadata_url: string;
};

type NFTGalleryProps = {
  onClose: () => void;
};

type SuiObjectFields = {
  name: number[];         // was string, now number[]
  url: number[];
  metadata_url: number[];
};

type SuiObjectContent = {
  type: string;
  fields: SuiObjectFields;
};

type SuiObjectData = {
  objectId: string;
  content?: SuiObjectContent;
};

type SuiGetOwnedObjectsResponse = {
  jsonrpc: string;
  id: number;
  result: {
    data: {
      data: SuiObjectData;
    }[];
  };
};

const NFTGallery: React.FC<NFTGalleryProps> = ({ onClose }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const SUI_ADDRESS =
    "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665";

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await fetch("https://fullnode.testnet.sui.io", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_getOwnedObjects",
            params: [SUI_ADDRESS, { options: { showContent: true } }],
          }),
        });

        const json: SuiGetOwnedObjectsResponse = await response.json();
        const objects = json.result.data;

        const avatarNfts: NFT[] = objects
          .filter((item) =>
            item.data?.content?.type.includes("AvatarNFT::Avatar")
          )
          .map((item) => {
            const fields = item.data.content!.fields;
            const decoder = new TextDecoder();
            return {
              objectId: item.data.objectId,
              name: decoder.decode(new Uint8Array(fields.name)),
              image_url: decoder.decode(new Uint8Array(fields.url)),
              metadata_url: decoder.decode(new Uint8Array(fields.metadata_url)),
            };
          });

        setNfts(avatarNfts);
      } catch (error) {
        console.error("❌ Failed to fetch NFTs:", error);
      }
    };

    fetchNFTs();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={24} />
        </button>
        <h2 className="text-2xl font-bold text-center mt-6">Your NFTs</h2>

        {nfts.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No NFTs found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
            {nfts.map((nft) => (
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
                <a
                  href={nft.metadata_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 underline"
                >
                  View Metadata
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTGallery;
