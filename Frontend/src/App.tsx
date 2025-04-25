import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import Header from "./components/Header";
import bgImage from "./assets/house-bg.jpg";
import logo from "./assets/conversia-lg.png";
import { useAuth } from '../src/hooks/useAuth';
import { useNavigate } from "react-router-dom";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css"; 


type Message = {
  message: string;
  sender: string;
  direction: "incoming" | "outgoing";
};

type InterviewProps = {
  interview_prompt: string | undefined;
};

const App: React.FC<InterviewProps> = () => {
  const wallet = useWallet();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [typingText, setTypingText] = useState("");
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);


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
  
      const response = await fetch("http://localhost:5555/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: lastMessage.message }),
      });
  
      const data = await response.json();
      const fullText = data.message?.text || "Maya belum bicara ya...";
      const audioUrl = "http://localhost:5555/audios/response.mp3";
  
      setTypingText(""); // Reset before typing
      setIsTyping(true);
  
      let audioDuration = 0;
      let audio: HTMLAudioElement | null = null;
  
      if (isSpeechEnabled && audioUrl) {
        try {
          // Bypass browser cache by appending a timestamp
          const freshAudioUrl = `${audioUrl}?t=${new Date().getTime()}`;
          const audioResponse = await fetch(freshAudioUrl);
          const audioBlob = await audioResponse.blob();
          const audioObjectUrl = URL.createObjectURL(audioBlob);
      
          audio = new Audio(audioObjectUrl);

          // add audio event listeners
          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => setIsSpeaking(false);

          await audio.play();
      
          audioDuration = audio.duration * 1000 || 2000; // Use duration to calculate typing delay
        } catch (err) {
          console.error("Error fetching or playing audio:", err);
        }
      }      
  
      // Fallback duration if audio not loaded
      const duration = audioDuration || fullText.length * 50;
      const interval = duration / fullText.length;
  
      let index = 0;
      let lastTime = performance.now();
  
      const typeChar = (time: number) => {
        if (time - lastTime >= interval && index < fullText.length) {
          setTypingText((prev) => prev + fullText.charAt(index));
          index++;
          lastTime = time;
        }
  
        if (index < fullText.length) {
          requestAnimationFrame(typeChar);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              message: fullText,
              sender: "Maya",
              direction: "incoming",
            },
          ]);
          setTypingText("");
          setIsTyping(false);
        }
      };
  
      requestAnimationFrame(typeChar);
  
    } catch (error) {
      console.error("🚨 Error communicating with backend:", error);
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

      {/* <button
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-[50]"
        onClick={logout}
      >
        Logout
      </button> */}
      <div className="absolute top-4 right-4 px-4 py-2 rounded-lg z-[50]">
        <ConnectButton />
      </div>
      
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

            {isTyping && typingText && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl text-lg">
                  {typingText}
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
            className={`text-white text-4xl cursor-pointer transition-opacity duration-300 ${
              isSpeechEnabled ? 'opacity-100' : 'opacity-50'
            } ${isSpeaking ? 'animate-pulse' : ''}`}
            onClick={toggleSpeech}
          >
            🎙️
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
