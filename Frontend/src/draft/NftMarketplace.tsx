import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

type NFT = {
  objectId: string;
  name: string;
  image_url: string;
  metadata_url: string;
  owner: string;
};

type MarketProps = {
  onClose: () => void;
};

type SuiObject = {
  data?: {
    objectId?: string;
    type?: string;
    content?: {
      fields?: {
        name?: string;
        url?: string;
        image?: string;
        metadata_url?: string;
        [key: string]: unknown;
      };
    };
  };
  owner?: {
    AddressOwner?: string;
    ObjectOwner?: string;
    Shared?: boolean;
    Immutable?: boolean;
  };
};

const RPC_ENDPOINT = "https://fullnode.mainnet.sui.io";
const walletAddress = "0xcdf86d8b2bee2139300484722b7563b09cfba83d6e5dc745d8f9af82a354557a";
const collectionId = "0xc8e29dd300e3f57c265e5883cb9e3ba36e4f2f8fe95a96f0b2f4c82b8a958dfe";

const NFTMarketplace: React.FC<MarketProps> = ({ onClose }) => {
  const [marketItems, setMarketItems] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  const isNFTObject = (objType?: string) => {
    if (!objType) return false;
    return objType.includes("NFT") || objType.includes("Collection") || objType.includes("::");
  };

  // Fetch objects owned by an address (wallet)
  const fetchOwnedObjects = async (owner: string): Promise<SuiObject[]> => {
    console.log(`Fetching objects owned by wallet: ${owner}`);
    const res = await fetch(RPC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "suix_getOwnedObjects",
        params: [owner, { options: { showContent: true, showType: true, showOwner: true } }],
      }),
    });
    const data = await res.json();
    console.log(`Owned objects response:`, data);
    if (!data.result || !Array.isArray(data.result.data)) return [];
    return data.result.data as SuiObject[];
  };

  // Fetch dynamic fields owned by an object (collection), representing minted NFTs
  const fetchDynamicFields = async (objectId: string) => {
    console.log(`Fetching dynamic fields of collection: ${objectId}`);
    const res = await fetch(RPC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "suix_getDynamicFields",
        params: [objectId],
      }),
    });
    const data = await res.json();
    console.log("Dynamic fields response:", data);
    if (!data.result || !Array.isArray(data.result.data)) return [];
    return data.result.data as { objectId: string; name: string }[];
  };

  // Fetch full object details by objectId
  const fetchObjectDetail = async (objectId: string): Promise<SuiObject | null> => {
    console.log(`Fetching object detail for ${objectId}`);
    const res = await fetch(RPC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getObject",
        params: [objectId],
      }),
    });
    const data = await res.json();
    if (!data.result) {
      console.error(`No result for object ${objectId}`, data);
      return null;
    }
    return data.result as SuiObject;
  };

  // Helper to fetch image from metadata URL
  const fetchMetadataImage = async (metadataUrl: string): Promise<string> => {
    if (!metadataUrl) return "";
    try {
      let url = metadataUrl;
      if (metadataUrl.startsWith("ipfs://")) {
        url = metadataUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      const metaRes = await fetch(url);
      const metaJson = await metaRes.json();
      console.log(`Metadata JSON from ${url}:`, metaJson);
      if (typeof metaJson.image === "string") {
        if (metaJson.image.startsWith("ipfs://")) {
          return metaJson.image.replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        return metaJson.image;
      }
      return "";
    } catch (e) {
      console.error("Failed to fetch metadata JSON", e);
      return "";
    }
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);

      try {
        // 1. Fetch NFTs owned by wallet
        const walletNFTsRaw = await fetchOwnedObjects(walletAddress);

        // 2. Fetch dynamic fields (minted NFTs) owned by collection
        const dynamicFields = await fetchDynamicFields(collectionId);

        // 3. Fetch details of each minted NFT from dynamic fields
        const mintedNFTObjects: SuiObject[] = [];
        for (const df of dynamicFields) {
          const detail = await fetchObjectDetail(df.objectId);
          if (detail) mintedNFTObjects.push(detail);
        }

        // Combine wallet-owned NFTs and minted NFTs in collection
        const allObjects = [...walletNFTsRaw, ...mintedNFTObjects];

        // Filter NFT objects by type string
        const nftObjects = allObjects.filter((obj) => isNFTObject(obj.data?.type));
        console.log("Filtered NFT objects count:", nftObjects.length);

        // Map to NFT array with image fetch
        const nfts: NFT[] = await Promise.all(
          nftObjects.map(async (obj) => {
            const fields = obj.data?.content?.fields || {};
            const owner =
              obj.owner?.AddressOwner ||
              obj.owner?.ObjectOwner ||
              "unknown owner";

            let imageUrl = "";
            if (typeof fields.url === "string") imageUrl = fields.url;
            else if (typeof fields.image === "string") imageUrl = fields.image;
            const metadataUrl =
              (typeof fields.metadata_url === "string" && fields.metadata_url) ||
              (typeof fields.url === "string" && fields.url) ||
              "";

            if (!imageUrl && metadataUrl) {
              imageUrl = await fetchMetadataImage(metadataUrl);
            }

            if (!imageUrl) {
              imageUrl = "https://via.placeholder.com/400x400?text=No+Image";
            } else if (imageUrl.startsWith("ipfs://")) {
              imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
            }

            return {
              objectId: obj.data?.objectId || "unknown",
              name: typeof fields.name === "string" ? fields.name : "Unknown NFT",
              image_url: imageUrl,
              metadata_url: metadataUrl,
              owner,
            };
          })
        );

        setMarketItems(nfts);
      } catch (error) {
        console.error("❌ Failed to fetch NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close marketplace"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-2xl font-bold text-center mt-6">Marketplace</h2>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading NFTs...</p>
        ) : marketItems.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No items listed for sale.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
            {marketItems.map((nft) => (
              <div key={nft.objectId} className="bg-gray-100 rounded-xl shadow-md p-4">
                <img
                  src={nft.image_url}
                  alt={nft.name}
                  className="w-full h-64 object-cover rounded-lg mb-2"
                />
                <h3 className="text-lg font-medium">{nft.name}</h3>
                <p className="text-sm text-gray-600 break-words">Owner: {nft.owner}</p>
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
