import React, { useState, useEffect } from "react";
import { X, Copy, Edit2, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!wallet.account?.address) return;

      try {
        const res = await fetch("http://localhost:5555/api/conversia/users", {
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

  const handleSaveUsername = async () => {
    if (!userId) return;

    try {
      await fetch(`http://localhost:5555/api/conversia/users/${userId}`, {
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl min-h-[700px] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Profile
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full flex gap-2 mb-6 p-0">
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

          <TabsContent value="info">
            <div className="space-y-4 text-lg text-gray-800 dark:text-gray-200">
              <div className="mb-6">
                <div className="text-green-600 font-bold mb-2">
                  <p className="text-start">Wallet Status: {wallet.status}</p>
                </div>
                <div className="w-full max-w-xs">
                  <ConnectButton />
                </div>
              </div>

              {wallet.status === "connected" && (
                <>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>Username:</strong>
                    </span>
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
                    <span>
                      <strong>Wallet Address:</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{wallet.account?.address}</span>
                      <Button size="icon" variant="ghost" onClick={handleCopy}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>
                      <strong>Ellipsis Address:</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span>
                        {addressEllipsis(wallet.account?.address || "")}
                      </span>
                      <Button size="icon" variant="ghost" onClick={handleCopy}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>
                      <strong>Chain :</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{wallet.chain?.name}</span>
                      <Button size="icon" variant="ghost" onClick={handleCopy}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
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
              <div className="space-y-3">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800">
                  <p className="font-medium">
                    🧝‍♀️ Purchased Avatar{" "}
                    <span className="text-blue-500 font-semibold">#3</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    12 April 2025
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800">
                  <p className="font-medium">
                    🏠 Switched Background to{" "}
                    <span className="text-purple-500 font-semibold">
                      Garage
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    10 April 2025
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="items">
            <div className="text-gray-700 dark:text-gray-300">
              <p className="mb-2">Your Avatars & Backgrounds:</p>
              <ul className="space-y-2 list-disc ml-5">
                <li>Avatar Girl 2</li>
                <li>Background: Conversia</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
