import React, { useEffect, useState } from "react";
import Background1 from "../assets/house-bg.jpg";
import Background2 from "../assets/garage-bg.jpg";
import Background3 from "../assets/conversia-bg.png";
import Background4 from "../assets/forest-bg.png";
import Background5 from "../assets/cyberpunk-bg.png";

import { Button } from "../components/ui/button";
import { X } from "lucide-react";

interface BackgroundOption {
  id: string;
  src: string;
  alt: string;
  image_id: number;
  owned: boolean;
}

interface BackgroundProps {
  onClose: () => void;
  onSelectBackground: (backgroundUrl: string) => void;
}

const cn = (...classes: (string | false | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Background: React.FC<BackgroundProps> = ({
  onClose,
  onSelectBackground,
}) => {
  const [selectedBackground, setSelectedBackground] =
    useState<BackgroundOption | null>(null);
  const [backgrounds, setBackgrounds] = useState<BackgroundOption[]>([
    {
      id: "bg1",
      image_id: 1,
      src: Background1,
      alt: "House Background",
      owned: false,
    },
    {
      id: "bg2",
      image_id: 2,
      src: Background2,
      alt: "Garage Background",
      owned: false,
    },
    {
      id: "bg3",
      image_id: 3,
      src: Background3,
      alt: "Conversia Background",
      owned: false,
    },
    {
      id: "bg4",
      image_id: 4,
      src: Background4,
      alt: "Forest Background",
      owned: false,
    },
    {
      id: "bg5",
      image_id: 5,
      src: Background5,
      alt: "City Background",
      owned: false,
    },
  ]);
  const host = import.meta.env.VITE_HOST;

  useEffect(() => {
    fetch(`${host}/api/conversia/users/2/background`)
      .then((res) => res.json())
      .then((data) => {
        const ownedImageIds = data.map((b: { image_id: number }) => b.image_id);
        setBackgrounds((prev) =>
          prev.map((bg) => ({
            ...bg,
            owned: ownedImageIds.includes(bg.image_id),
          }))
        );
      })
      .catch((err) => console.error("Failed to fetch backgrounds:", err));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-3xl font-bold">Select Background</h2>
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
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Choose a background for your avatar scene.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {backgrounds.map((bg) => (
              <div
                key={bg.id}
                className={cn(
                  "relative rounded-lg overflow-hidden border-4 transition-all",
                  bg.owned
                    ? "cursor-pointer hover:shadow-lg"
                    : "cursor-not-allowed opacity-60 grayscale",
                  selectedBackground?.image_id === bg.image_id
                    ? "border-blue-500"
                    : "border-transparent"
                )}
                onClick={() => bg.owned && setSelectedBackground(bg)}
              >
                <div className="aspect-video relative">
                  <img
                    src={bg.src}
                    alt={bg.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                  {bg.alt}
                  {!bg.owned && (
                    <span className="ml-2 text-xs opacity-75">(Not owned)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => {
              if (selectedBackground) {
                onSelectBackground(selectedBackground.src);
                onClose();
              }
            }}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedBackground}
          >
            Select Background
          </button>
        </div>
      </div>
    </div>
  );
};

export default Background;
