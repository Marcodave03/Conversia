import React from "react"
import Girl1 from "../assets/girl1.png"
import Girl2 from "../assets/girl2.png"
import Girl3 from "../assets/girl3.png"
import Girl4 from "../assets/girl4.png"
import Girl5 from "../assets/girl5.png"
import Boy1 from "../assets/boy1.png"

interface Avatar {
  id: string
  src: string
  alt: string
  owned: boolean
}

interface AvatarPickProps {
  onClose: () => void
}

const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ")

const AvatarPick: React.FC<AvatarPickProps> = ({ onClose }) => {
  const avatars: Avatar[] = [
    { id: "girl1", src: Girl1, alt: "Girl Avatar 1", owned: true },
    { id: "girl2", src: Girl2, alt: "Girl Avatar 2", owned: false },
    { id: "girl3", src: Girl3, alt: "Girl Avatar 3", owned: true },
    { id: "girl4", src: Girl4, alt: "Girl Avatar 4", owned: false },
    { id: "girl5", src: Girl5, alt: "Girl Avatar 5", owned: true },
    { id: "boy1", src: Boy1, alt: "Boy Avatar 1", owned: false },
  ]

  const [selectedAvatar, setSelectedAvatar] = React.useState<string | null>(null)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-4xl min-h-[700px] p-6">
        <div className="mb-4">
          <h2 className="text-3xl font-bold">Avatar</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Choose your avatar from the collection below. Greyed out avatars are not yet owned.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={cn(
                "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                selectedAvatar === avatar.id ? "border-blue-500" : "border-transparent",
                "hover:shadow-lg"
              )}
              onClick={() => setSelectedAvatar(avatar.id)}
            >
              <div className="aspect-square relative">
                <img
                  src={avatar.src}
                  alt={avatar.alt}
                  className={cn(
                    "w-full h-full object-cover transition-all",
                    !avatar.owned && "grayscale"
                  )}
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
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            disabled={!selectedAvatar}
          >
            Select Avatar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AvatarPick
