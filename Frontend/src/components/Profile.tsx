import React, { useState, useEffect } from "react";
import { X, Copy, Edit2, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import SuiLogo from "../assets/sui-logo.png";
import Logo from "../assets/conversia-svg.png";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useWallet, ConnectButton, addressEllipsis } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";

interface ProfileProps {
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const wallet = useWallet();
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("loading...");
  const [editing, setEditing] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>("");
  interface Transaction {
    digest: string;
    timestampMs?: string;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ownedNFTs, setOwnedNFTs] = useState<
    { name: string; objectId: string }[]
  >([]);
  const [suiBalance, setSuiBalance] = useState<string>("0");
  const [nftCount, setNftCount] = useState<number>(0);
  const host = import.meta.env.VITE_HOST;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!wallet.account?.address) return;

      try {
        const res = await fetch(`${host}/api/conversia/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sui_id: wallet.account.address,
            username: "anonymous",
          }),
        });

        const data = await res.json();
        if (data.user) {
          setUserId(data.user.user_id);
          setUsername(data.user.username || "anonymous");
          setNewUsername(data.user.username || "");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    if (wallet.status === "connected") {
      fetchUserData();
    }
  }, [wallet]);

  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (!wallet.account?.address) return;

      try {
        const res = await fetch("https://fullnode.testnet.sui.io", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_getOwnedObjects",
            params: [
              wallet.account.address,
              { options: { showContent: true } },
            ],
          }),
        });

        const json = await res.json();
        const objects = json.result?.data || [];

        const decoder = new TextDecoder();
        interface OwnedObject {
          data?: {
            content?: {
              type: string;
              fields: {
                name: ArrayLike<number>;
              };
            };
            objectId: string;
          };
        }

        const filtered = objects
          .filter((item: OwnedObject) =>
            item.data?.content?.type.includes("AvatarNFT::Avatar")
          )
          .map((item: OwnedObject) => {
            const fields = item.data!.content!.fields;
            return {
              name: decoder.decode(new Uint8Array(fields.name)),
              objectId: item.data!.objectId,
            };
          });

        setOwnedNFTs(filtered);
      } catch (error) {
        console.error("Failed to fetch owned NFTs", error);
      }
    };

    if (wallet.status === "connected") {
      fetchOwnedNFTs();
    }
  }, [wallet]);

  const handleSaveUsername = async () => {
    if (!userId) return;

    try {
      await fetch(`${host}/api/conversia/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });
      setUsername(newUsername);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update username:", err);
    }
  };

  const handleCopy = () => {
    if (wallet.account?.address) {
      navigator.clipboard.writeText(wallet.account.address);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!wallet.account?.address) return;

      try {
        const res = await fetch("https://fullnode.testnet.sui.io", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_queryTransactionBlocks",
            params: [
              {
                filter: {
                  FromAddress: wallet.account.address,
                },
                options: {
                  showInput: true,
                  showEffects: true,
                  showBalanceChanges: true,
                },
              },
              { limit: 10 },
            ],
          }),
        });

        const json = await res.json();
        setTransactions(json.result?.data || []);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    };

    if (wallet.status === "connected") {
      fetchTransactions();
    }
  }, [wallet]);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!wallet.account?.address) return;

      try {
        // Fetch balance
        const balanceRes = await fetch("https://fullnode.testnet.sui.io", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_getBalance",
            params: [wallet.account.address],
          }),
        });
        const balanceJson = await balanceRes.json();
        const suiAmount = parseFloat(balanceJson.result.totalBalance) / 1e9;
        setSuiBalance(suiAmount.toFixed(3));

        // Fetch NFTs
        const nftRes = await fetch("https://fullnode.testnet.sui.io", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_getOwnedObjects",
            params: [
              wallet.account.address,
              { options: { showContent: true } },
            ],
          }),
        });
        const nftJson = await nftRes.json();
        interface NFTObject {
          data?: {
            content?: {
              type?: string;
            };
          };
        }
        const nfts =
          nftJson.result?.data?.filter((obj: NFTObject) =>
            obj.data?.content?.type?.includes("AvatarNFT::Avatar")
          ) || [];
        setNftCount(nfts.length);
      } catch (error) {
        console.error("❌ Failed to fetch wallet data", error);
      }
    };

    if (wallet.status === "connected") {
      fetchWalletData();
    }
  }, [wallet]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-3xl font-bold">Your Profile</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full flex gap-2 mb-4 p-0">
              <TabsTrigger
                value="info"
                className="w-1/3 text-sm text-center rounded-md border border-gray-300 leading-tight h-12 flex flex-col justify-center items-center bg-gray-100 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:border"
              >
                Wallet
                <br />
                Info
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="w-1/3 text-sm text-center rounded-md border border-gray-300 leading-tight h-12 flex flex-col justify-center items-center bg-gray-100 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:border"
              >
                Transaction
                <br />
                History
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="w-1/3 text-sm text-center rounded-md border border-gray-300 leading-tight h-12 flex flex-col justify-center items-center bg-gray-100 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:border"
              >
                Owned
                <br />
                Items
              </TabsTrigger>
            </TabsList>

            {/* Wallet Info */}
            <TabsContent value="info">
              <div className="space-y-4 text-gray-800 dark:text-gray-200 text-sm">
                <div>
                  <div className="grid grid-cols-2 gap-4 text-center mb-2">
                    <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm">
                      <img
                        src={SuiLogo}
                        alt="SUI"
                        className="w-6 h-6 mx-auto mb-1"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Token Balance
                      </p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {suiBalance} SUI
                      </p>
                    </div>
                    <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm">
                      <img
                        src={Logo}
                        alt="SUI"
                        className="w-8 h-8 mx-auto mb-1"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        NFTs Owned
                      </p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {nftCount}
                      </p>
                    </div>
                  </div>
                  <p className="text-green-600 font-bold">
                    Wallet Status: {wallet.status}
                  </p>
                  <div className="mt-2 w-full max-w-xs">
                    <ConnectButton />
                  </div>
                </div>

                {wallet.status === "connected" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Username:</span>
                      {editing ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            className="h-8 w-48"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                          />
                          <Button size="sm" onClick={handleSaveUsername}>
                            <Save className="w-4 h-4 mr-1" /> Save
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{username}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditing(true)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Wallet Address:</span>
                      <div className="flex items-center gap-2 max-w-[60%]">
                        <span className="truncate max-w-[120px] overflow-hidden whitespace-nowrap text-sm">
                          {wallet.account?.address}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCopy}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Ellipsis Address:</span>
                      <div className="flex items-center gap-2 max-w-[60%]">
                        <span>
                          {addressEllipsis(wallet.account?.address || "")}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCopy}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Chain:</span>
                      <div className="flex items-center gap-2"></div>
                      <span>{wallet.chain?.name}</span>
                      <Button size="icon" variant="ghost" onClick={handleCopy}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <h3 className="text-xl font-semibold mb-2">
                  Recent Transactions
                </h3>

                {transactions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent transactions found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx, index) => (
                      <div
                        key={tx.digest || index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800"
                      >
                        <p className="font-medium">
                          🧾 Tx Hash:{" "}
                          <span className="text-blue-500 font-mono break-all">
                            {tx.digest}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(
                            tx.timestampMs ? Number(tx.timestampMs) : 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Owned Items */}
            <TabsContent value="items">
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                <p className="mb-4 font-medium">Your Avatars & Backgrounds:</p>

                {ownedNFTs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No NFTs found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ownedNFTs.map((nft, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800"
                      >
                        <p className="font-semibold mb-1">{nft.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
                          {nft.objectId}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 text-right text-sm text-gray-400">
          Connected via Sui Wallet
        </div>
      </div>
    </div>
  );
};

export default Profile;
