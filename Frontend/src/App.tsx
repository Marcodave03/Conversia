import React, { useState } from "react";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import Header from "./components/Header";
import bgImage from "./assets/house-bg.jpg";

// import { Avatar } from "./components/Avatar";

// Replace with your actual API key
const API_KEY = "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";

// Define the system message
const systemMessage = {
  role: "system",
  content: "Kamu jadi pacar perempuan aku, tanya kabar tentang aku dan keseharianku. Gunakan kata kata yang informal dan ngobrol layaknya manusia. kalimat tidak perlu terlalu panjang",
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

      <Header />
      
      <div className="flex-1 flex">
        <div className="w-full h-full relative">

          {/* Chat messages */}
          <div className="h-[70vh] max-h-[70vh] overflow-y-auto space-y-4 p-4 absolute top-[5%] left-[55%] w-[43%] z-30"
              style={{
                position: 'relative'
              }}
          >
            <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-[#000000]/30 to-transparent z-40 pointer-events-none"></div>

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
          <div className="absolute left-0 bottom-0 w-[50vw] h-[100vh] z-20 bg-transparent">
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
      <div className="absolute z-[10] bottom-8 right-10 chats input-container bg-gray-800 bg-opacity-90 h-[7vh] flex items-center w-[43%] mx-auto rounded-full px-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Start typing ..."
          className="border-none bg-transparent w-full text-white placeholder-white placeholder-opacity-70 text-2xl focus:outline-none px-4 py-2"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          style={{
            paddingLeft: "50px", 
            paddingTop: "4px",   
          }}
        />


        {/* Speech section */}
        <div className="flex gap-4 items-center">
        <span
          className={`text-white text-4xl cursor-pointer ${isSpeechEnabled ? 'opacity-100' : 'opacity-50'}`}
          onClick={toggleSpeech}
          style={{
            transform: 'scale(1.5)',
            marginRight: '55px',     
            marginTop: '2px',         
          }}
        >
          🎙️
        </span>
        </div>
      </div>
    </div>
  );
};

export default App;
