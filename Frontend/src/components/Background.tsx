import React from "react"
import Background1 from "../assets/house-bg.jpg"
import Background2 from "../assets/garage-bg.jpg"
import Background3 from "../assets/conversia-bg.png"

interface BackgroundOption {
  id: string
  src: string
  alt: string
}

interface BackgroundProps {
  onClose: () => void
}

const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ")

const Background: React.FC<BackgroundProps> = ({ onClose }) => {
  const backgrounds: BackgroundOption[] = [
    { id: "bg1", src: Background1, alt: "House Background" },
    { id: "bg2", src: Background2, alt: "Garage Background" },
    { id: "bg3", src: Background3, alt: "Conversia Background" },
  ]

  const [selectedBackground, setSelectedBackground] = React.useState<string | null>(null)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl min-h-[500px] p-6">
        <div className="mb-4">
          <h2 className="text-3xl font-bold">Select Background</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a background for your avatar scene.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-6">
          {backgrounds.map((bg) => (
            <div
              key={bg.id}
              className={cn(
                "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                selectedBackground === bg.id ? "border-blue-500" : "border-transparent",
                "hover:shadow-lg"
              )}
              onClick={() => setSelectedBackground(bg.id)}
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
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            disabled={!selectedBackground}
          >
            Select Background
          </button>
        </div>
      </div>
    </div>
  )
}

export default Background
