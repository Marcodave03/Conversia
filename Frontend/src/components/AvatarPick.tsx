import React, { useEffect, useState } from "react";
import Girl1 from "../assets/girl1.png";
import Girl2 from "../assets/girl2.png";
import Girl3 from "../assets/girl3.png";
import Girl4 from "../assets/girl4.png";
import Girl5 from "../assets/girl5.png";
import Boy1 from "../assets/boy1.png";

interface Avatar {
  id: string; // this should match model_id from API
  src: string;
  alt: string;
  modelUrl: string;
  owned: boolean;
}

interface AvatarPickProps {
  onClose: () => void;
  onSelectAvatar: (modelUrl: string) => void;
  userId: number;
}

interface UserAvatar {
  model_id: string;
}

const modelIdToAvatarId: Record<number, string> = {
  1: "girl1",
  2: "girl2",
  3: "girl3",
  4: "girl4",
  5: "girl5",
  6: "boy1",
};


const avatarCatalog: Avatar[] = [
  { id: "girl1", src: Girl1, alt: "Girl Avatar 1", modelUrl: "/models/girl1.glb", owned: false },
  { id: "girl2", src: Girl2, alt: "Girl Avatar 2", modelUrl: "/models/girl2.glb", owned: false },
  { id: "girl3", src: Girl3, alt: "Girl Avatar 3", modelUrl: "/models/girl3.glb", owned: false },
  { id: "girl4", src: Girl4, alt: "Girl Avatar 4", modelUrl: "/models/girl4.glb", owned: false },
  { id: "girl5", src: Girl5, alt: "Girl Avatar 5", modelUrl: "/models/girl5.glb", owned: false },
  { id: "boy1", src: Boy1, alt: "Boy Avatar 1", modelUrl: "/models/boy1.glb", owned: false },
];

const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

const AvatarPick: React.FC<AvatarPickProps> = ({ onClose, onSelectAvatar, userId }) => {
  const [avatars, setAvatars] = useState<Avatar[]>(avatarCatalog);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5555/api/conversia/users/${userId}/avatars`)
      .then((res) => res.json())
      .then((data: UserAvatar[]) => {
        const ownedAvatarIds = data
          .map((item) => modelIdToAvatarId[parseInt(item.model_id)])
          .filter(Boolean); // remove undefined
  
        const updatedAvatars = avatarCatalog.map((avatar) => ({
          ...avatar,
          owned: ownedAvatarIds.includes(avatar.id),
        }));
        setAvatars(updatedAvatars);
      })
      .catch((err) => console.error("Failed to fetch avatars:", err));
  }, [userId]);

  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl min-h-[700px] p-6">
        <h2 className="text-3xl font-bold mb-4">Pick Your Avatar</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Select from your owned avatars. Greyed-out avatars are not owned.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={cn(
                "relative rounded-lg overflow-hidden border-2 transition-all",
                avatar.owned
                  ? "cursor-pointer hover:shadow-lg"
                  : "cursor-not-allowed opacity-60",
                selectedAvatar?.id === avatar.id ? "border-blue-500" : "border-transparent"
              )}
              onClick={() => avatar.owned && setSelectedAvatar(avatar)}
            >
              <div className="aspect-square relative">
                <img
                  src={avatar.src}
                  alt={avatar.alt}
                  className={cn("w-full h-full object-cover", !avatar.owned && "grayscale")}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                {avatar.alt}
                {!avatar.owned && <span className="ml-2 text-xs opacity-75">(Not owned)</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedAvatar) {
                onSelectAvatar(selectedAvatar.modelUrl);
                onClose();
              }
            }}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            disabled={!selectedAvatar}
          >
            Select Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPick;
