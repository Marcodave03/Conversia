import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import Header from "./components/Header";
import bgImage from "./assets/conversia-bg.png";
import { MouthCue } from "./components/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@suiet/wallet-kit";

type Message = {
  message: string;
  sender: string;
  direction: "incoming" | "outgoing";
};

type InterviewProps = {
  interview_prompt: string | undefined;
};

type ChatHistoryItem = {
  message: string;
  sender: "user" | "system";
};

const App: React.FC<InterviewProps> = () => {
  const wallet = useWallet();
  const [modelId, setModelId] = useState<number>(1);
  const [userId, setUserId] = useState<number>();
  const [currentExpression, setCurrentExpression] = useState<string | null>(
    null
  );
  const [modelUrl, setModelUrl] = useState<string>("/models/girl1.glb"); // default avatar
  const [backgroundUrl, setBackgroundUrl] = useState<string>(bgImage); // use default bg as fallback

  // Hide intro after animation finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3500); // typing duration + slide

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const ensureUserExists = async () => {
      const walletAddress = wallet.account?.address;
      if (!walletAddress) return;

      try {
        // Create or get user by wallet address
        const res = await fetch("http://localhost:5555/api/conversia/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sui_id: walletAddress,
            username: "anonymous", // or get username from somewhere else
          }),
        });

        const data = await res.json();
        if (data.user?.user_id) {
          setUserId(data.user.user_id);
        }
      } catch (err) {
        console.error("Failed to ensure user:", err);
      }
    };

    if (wallet.status === "connected") {
      ensureUserExists();
    }
  }, [wallet]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!userId || !modelId) return;

      try {
        const res = await fetch(
          `http://localhost:5555/api/conversia/chat-history/${userId}/${modelId}`
        );
        const data = await res.json();

        const formatted = (data as ChatHistoryItem[]).map(
          (msg): Message => ({
            message: msg.message,
            sender: msg.sender === "user" ? "Aku" : "Maya",
            direction: msg.sender === "user" ? "outgoing" : "incoming",
          })
        );

        setMessages(formatted);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadChatHistory();
  }, [userId, modelId]);

  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [currentMouthCues, setCurrentMouthCues] = useState<MouthCue[]>([]);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [typingText, setTypingText] = useState("");
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [loadingTranscription, setLoadingTranscription] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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

      const response = await fetch(
        `http://localhost:5555/api/conversia/chat-history/${userId}/${modelId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: lastMessage.message,
            sender: "user",
          }),
        }
      );

      const data = await response.json();
      const fullText = data.system?.message || "Maya belum bicara ya...";
      const soundDuration = data.system?.lipsync?.metadata?.duration || 2;
      const mouthCues = data.system?.lipsync?.mouthCues || [];
      const facialExpression = data.system?.facialExpression || "default";
      const animation = data.system?.animation || "Idle";
      const audioUrl = "http://localhost:5555/audios/response.mp3";

      setTypingText("");
      setCurrentExpression(facialExpression);
      setCurrentAnimation(animation);
      setCurrentMouthCues(mouthCues);
      setAudioDuration(soundDuration * 1000);
      setIsTyping(true);

      // Play audio if enabled
      let audioDuration = 0;
      if (isSpeechEnabled && audioUrl) {
        try {
          const freshAudioUrl = `${audioUrl}?t=${new Date().getTime()}`;
          const audioResponse = await fetch(freshAudioUrl);
          const audioBlob = await audioResponse.blob();
          const audioObjectUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioObjectUrl);

          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => setIsSpeaking(false);

          await new Promise((resolve) => {
            audio.onloadedmetadata = () => {
              const safeDuration = audio.duration * 1000;
              setAudioDuration(safeDuration);
              resolve(audio.play());
            };
          });
          await audio.play();
          audioDuration = audio.duration * 1000 || 2000;
        } catch (err) {
          console.error("Error playing audio:", err);
        }
      }

      // Typing effect
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
          const aiMessage: Message = {
            message: fullText,
            sender: "Maya",
            direction: "incoming",
          };
          setMessages((prev) => [...prev, aiMessage]);
          setTypingText("");
          setIsTyping(false);
        }
      };

      requestAnimationFrame(typeChar);
    } catch (error) {
      console.error("Error talking to backend:", error);
      setIsTyping(false);
    }
  }

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          try {
            setLoadingTranscription(true); // === ADD THIS ===

            const response = await fetch(
              `http://localhost:5555/api/conversia/speech-to-text/${userId}/${modelId}`,
              {
                method: "POST",
                body: formData,
              }
            );

            const data = await response.json();

            if (data?.system?.message) {
              // Push user and system messages
              const newMessage: Message = {
                message: data.user.message,
                direction: "outgoing",
                sender: "Aku",
              };
              const systemMessage: Message = {
                message: data.system.message,
                direction: "incoming",
                sender: "Maya",
              };

              setMessages((prev) => [...prev, newMessage, systemMessage]);
              setCurrentExpression(data.system.facialExpression || "default");
              setCurrentAnimation(data.system.animation || "Talking_1");
              setCurrentMouthCues(data.system.lipsync?.mouthCues || []);
              setAudioDuration(
                data.system.lipsync?.metadata?.duration * 1000 || 2000
              );

              // Play audio
              if (isSpeechEnabled && data.system.audio) {
                const audioBlob = new Blob(
                  [
                    Uint8Array.from(atob(data.system.audio), (c) =>
                      c.charCodeAt(0)
                    ),
                  ],
                  { type: "audio/mpeg" }
                );
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.onplay = () => setIsSpeaking(true);
                audio.onended = () => setIsSpeaking(false);
                await audio.play();
              }
            }
          } catch (err) {
            console.error("Speech-to-Text failed:", err);
          } finally {
            setLoadingTranscription(false); // === ADD THIS ===
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start recording:", err);
      }
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 bg-black flex justify-center items-center z-[1001]"
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-blue-500 text-5xl md:text-7xl font-bold typing-effect">
              Conversia
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="h-screen w-full flex flex-col overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 0.5s ease",
        }}
      >
        <Header
          setModelUrl={setModelUrl}
          setBackgroundUrl={setBackgroundUrl}
          setModelId={setModelId}
          userId={userId}
        />
        <div className="flex-1 flex">
          <div className="w-full h-full relative">
            {/* Chat messages */}
            <div
              className="h-[80vh] overflow-y-auto scrollbar-none  space-y-4 p-4 absolute top-[10%] left-[55%] w-[43%] z-30"
              style={{
                position: "relative",
                scrollbarWidth: "thin",
                scrollbarColor: "#FFFFFFFF transparent",
              }}
            >
              <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-[#000000]/30 to-transparent z-40 pointer-events-none"></div>

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.direction === "outgoing"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[60%] p-3 rounded-xl text-lg ${
                      msg.sender === "Maya"
                        ? "bg-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-xl text-lg flex items-center gap-1 min-h-[40px]">
                    {typingText ? (
                      typingText
                    ) : (
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {loadingTranscription && (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Avatar (with lower z-index) */}
            <div className="absolute left-0 bottom-0 w-[50vw] h-[100vh] z-20 bg-transparent">
              <Canvas
                shadows
                camera={{ position: [0, -0.5, 1], fov: 10 }}
                style={{ width: "100%", height: "100%" }}
                gl={{ alpha: true, preserveDrawingBuffer: true }}
              >
                <Experience
                  expression={currentExpression}
                  animation={currentAnimation}
                  mouthCues={currentMouthCues}
                  audioDuration={audioDuration}
                  modelUrl={modelUrl}
                />
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
            {/* Recording button */}
            <span
              className={`text-white text-4xl cursor-pointer transition-opacity duration-300 ${
                isRecording ? "text-red-500 animate-pulse" : "opacity-50"
              }`}
              onClick={toggleRecording}
            >
              🎙️
            </span>

            {/* Text-to-Speech toggle button */}
            <span
              className={`text-white text-4xl cursor-pointer transition-opacity duration-300 ${
                isSpeechEnabled ? "opacity-100" : "opacity-50"
              } ${isSpeaking ? "animate-pulse" : ""}`}
              onClick={toggleSpeech}
            >
              🔈
            </span>

            {/* Listening status text */}
            {isRecording && (
              <div className="flex items-center ml-2 animate-pulse">
                <span className="text-red-500 text-2xl">🎤</span>
                <span className="text-red-500 font-semibold ml-2">
                  Recording...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
