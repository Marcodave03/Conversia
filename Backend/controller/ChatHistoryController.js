import ChatHistory from "../models/ChatHistory.js";
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import {
  elevenLabsTTS,
  generateLipSyncData,
  readJsonFile,
} from "../utils/utils.js";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

// Memory cache per user-avatar combo
const messageHistoryCache = new Map();


function getMemoryKey(user_id, model_id) {
  return `${user_id}-${model_id}`;
}

async function getOrCreateMessageHistory(user_id, model_id) {
  const key = getMemoryKey(user_id, model_id);
  if (!messageHistoryCache.has(key)) {
    const history = new ChatMessageHistory();
    try {
      const records = await ChatHistory.findAll({
        where: { user_id, model_id },
        order: [["createdAt", "ASC"]],
      });
      for (const item of records) {
        if (item.sender === "user") {
          history.addUserMessage(item.message);
        } else {
          history.addAIMessage(item.message);
        }
      }
    } catch (err) {
      console.error("❌ Failed loading chat history from DB:", err);
    }
    messageHistoryCache.set(key, history);
  }
  return messageHistoryCache.get(key);
}

const ChatHistoryController = {

  

  

  async getHistory(req, res) {
    const { user_id, model_id } = req.params;
    try {
      const history = await ChatHistory.findAll({
        where: { user_id, model_id },
        order: [["createdAt", "ASC"]],
      });
      res.json(history);
    } catch (err) {
      console.error("❌ Error fetching chat history:", err);
      res.status(500).json({ error: "Failed to load history" });
    }
  },

  async addMessage(req, res) {
    const { user_id, model_id } = req.params;
    const { message, sender } = req.body;

    if (!message || !["user", "system"].includes(sender)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      // Save user message
      const userMsg = await ChatHistory.create({
        user_id,
        model_id,
        message,
        sender,
      });

      // If system message, just save and return
      if (sender === "system") {
        return res.status(201).json({ system: userMsg });
      }

      const sessionId = getMemoryKey(user_id, model_id);
      const chain = new RunnableWithMessageHistory({
        runnable: new ChatOpenAI({
          modelName: "gpt-3.5-turbo",
          temperature: 0.7,
        }),
        getMessageHistory: async () =>
          await getOrCreateMessageHistory(user_id, model_id),
        inputKey: "input",
        historyKey: "chat_history",
      });

      const langResponse = await chain.invoke(
        { input: message },
        { configurable: { sessionId } }
      );

      const aiText = langResponse?.content || "Maaf, aku belum bisa menjawab.";

      // Optional: TTS and animation via /chat pipeline
      // let lipsync = null, facialExpression = null, animation = null;
      // try {
      //   const resp = await fetch("http://localhost:5555/chat", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ message: aiText })
      //   });

      //   const data = await resp.json();
      //   facialExpression = data.message?.facialExpression || "default";
      //   animation = data.message?.animation || "Idle";
      //   lipsync = data.message?.lipsync || null;
      // } catch (err) {
      //   console.warn("⚠️ Failed to enrich with TTS/animation:", err);
      // }
      const voiceID = "21m00Tcm4TlvDq8ikWAM";

      const audioFile = `audios/response.mp3`;
      const wavFile = `audios/response.wav`;
      const jsonFile = `audios/response.json`;

      let lipsync = null;
      let facialExpression = "default";
      let animation = "Talking_1"; // or randomize later

      try {
        await elevenLabsTTS(
          process.env.ELEVEN_LABS_API_KEY,
          voiceID,
          aiText,
          audioFile
        );
      await generateLipSyncData(audioFile, wavFile, jsonFile);
        lipsync = await readJsonFile(jsonFile);
      } catch (err) {
        console.warn("⚠️ Failed TTS or lipsync:", err.message);
      }
      

      const systemMsg = await ChatHistory.create({
        user_id,
        model_id,
        message: aiText,
        sender: "system",
      });

      res.status(201).json({
        user: userMsg,
        system: {
          ...systemMsg.toJSON(),
          facialExpression,
          animation,
          lipsync,
        },
      });
    } catch (err) {
      console.error("❌ Error in addMessage:", err);
      res
        .status(500)
        .json({ error: "Failed to process chat message", detail: err.message });
    }
  },
};

export default ChatHistoryController;
