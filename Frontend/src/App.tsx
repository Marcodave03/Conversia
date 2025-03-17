import React, { useState } from "react";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import bgImage from "./assets/house-bg.jpg";

// import { Avatar } from "./components/Avatar";

// Replace with your actual API key
const API_KEY = "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";

// Define the system message
const systemMessage = {
  role: "system",
  content: "Kamu jadi pacar perempuan aku, tanya kabar aku dari ${props.interview_prompt}. Gunakan kata kata yang informal dan ngobrol layaknya manusia. kalimat tidak perlu terlalu panjang",
};

// Define the message type
type Message = {
  message: string;
  sender: string;
  direction: "incoming" | "outgoing";
};

// Define the props type
type InterviewProps = {
  interview_prompt: string | undefined;
};

const App: React.FC<InterviewProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false); // Add state for toggle

  // Handle sending a message
  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessage: Message = {
      message: userInput,
      direction: "outgoing",
      sender: "Aku",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setUserInput("");
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  // Process messages for ChatGPT
  async function processMessageToChatGPT(chatMessages: Message[]) {
    const apiMessages = chatMessages.map((messageObject) => {
      const role = messageObject.sender === "Maya" ? "assistant" : "user";
      return { role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiRequestBody),
        }
      );
      const data = await response.json();
      console.log(data);

      const newMessage: Message = {
        message: data.choices[0].message.content || "Pesan tidak tersedia",
        sender: "Maya",
        direction: "incoming",
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // If speech is enabled, read the message aloud
      if (isSpeechEnabled) {
        speakMessage(newMessage.message);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsTyping(false);
    }
  }

  // Function to speak the message
  const speakMessage = (message: string) => {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "id-ID"; // Set language to Indonesian
    window.speechSynthesis.speak(speech);
  };

  // Toggle text-to-speech
  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden"
    style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
    >
      <div className="flex-1 flex">
        <div className="w-full h-full relative">
          {/* Chat messages */}
          <div className="h-[85vh] overflow-y-auto space-y-4 p-4 absolute top-0 left-[35%] w-[30%] z-30">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.direction === "outgoing" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[60%] p-3 rounded-xl text-lg ${
                    msg.sender === "Maya" ? "bg-white" : "bg-blue-500 text-white"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl text-lg">
                  typing...
                </div>
              </div>
            )}
          </div>

          {/* Avatar (with lower z-index) */}
          <div className="absolute left-0 bottom-0 w-[40vw] h-[90vh] z-20 bg-transparent">
            <Canvas
              shadows
              camera={{ position: [0, -0.5, 1], fov: 10 }}
              style={{ width: "100%", height: "100%" }}
              gl={{ alpha: true, preserveDrawingBuffer: true }}
            >
              <Experience />
            </Canvas>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="chats input-container p-4 border-t-4 border-t-pink-300 bg-pink-300 h-[12vh] flex items-center w-[30%] mx-auto rounded-xl">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here..."
          className="border rounded px-4 py-2 w-[85%] text-lg mr-4"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={isTyping}
          className="bg-blue-500 text-white rounded px-4 py-2 w-[10%] h-[6vh] text-lg"
        >
          Send
        </button>
        <div className="w-[5%]">
          <input
            type="checkbox"
            checked={isSpeechEnabled}
            onChange={toggleSpeech}
            className="w-12 h-12 ml-4 items-center"
          />
        </div>
      </div>
    </div>
  );
};

export default App;
