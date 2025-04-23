import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import Header from "./components/Header";
import bgImage from "./assets/house-bg.jpg";
import logo from "./assets/conversia-lg.png";
import { useAuth } from '../src/hooks/useAuth';
import { useNavigate } from "react-router-dom";


type Message = {
  message: string;
  sender: string;
  direction: "incoming" | "outgoing";
};

type InterviewProps = {
  interview_prompt: string | undefined;
};

const App: React.FC<InterviewProps> = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);

  // Redirect unauthorized users
  if (!isAuthenticated) {
    navigate('/landing');
    return null;
  }

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

  async function processMessageToChatGPT(chatMessages: Message[]) {
    try {
      const lastMessage = chatMessages[chatMessages.length - 1];
  
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: lastMessage.message }),
      });
  
      // Backend sends an audio file as a stream + X-Chat-Text header
      const audioBlob = await response.blob();
      const chatText = decodeURIComponent(response.headers.get("X-Chat-Text") || "Maya belum bicara ya...");
      const audioUrl = URL.createObjectURL(audioBlob);
  
      const newMessage: Message = {
        message: chatText,
        sender: "Maya",
        direction: "incoming",
      };
  
      setMessages((prev) => [...prev, newMessage]);
  
      if (isSpeechEnabled) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error("Error talking to backend:", error);
    } finally {
      setIsTyping(false);
    }
  }

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <a href="/" className="absolute top-1 left-4 z-50">
        <img
          src={logo}
          alt="Conversia Logo"
          style={{ height: "150px", width: "auto" }}
          className="cursor-pointer shadow-lg rounded-full hover:opacity-80 transition-opacity duration-200"
        />
      </a>

      <Header />

      <button
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-[50]"
        onClick={logout}
      >
        Logout
      </button>

      <div className="flex-1 flex">
        <div className="w-full h-full relative">

          {/* Chat messages */}
          <div className="h-[70vh] max-h-[70vh] overflow-y-auto space-y-4 p-4 absolute top-[10%] left-[55%] w-[43%] z-30"
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
