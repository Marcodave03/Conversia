import ChatHistory from "../models/ChatHistory.js";
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableSequence } from "@langchain/core/runnables";

// Global memory cache for (user_id, model_id)
const memoryCache = new Map();

function getMemoryKey(user_id, model_id) {
  return `${user_id}-${model_id}`;
}

async function initializeMemory(user_id, model_id) {
  const key = getMemoryKey(user_id, model_id);

  if (!memoryCache.has(key)) {
    const messageHistory = new ChatMessageHistory();

    const history = await ChatHistory.findAll({
      where: { user_id, model_id },
      order: [["createdAt", "ASC"]],
    });

    for (const item of history) {
      if (item.sender === "user") {
        messageHistory.addUserMessage(item.message);
      } else {
        messageHistory.addAIMessage(item.message);
      }
    }

    const memory = new BufferMemory({
      memoryKey: "chat_history",
      inputKey: "input",         // Required for LangChain memory to work properly
      outputKey: "output",       // Required
      returnMessages: true,
      chatHistory: messageHistory,
    });

    memoryCache.set(key, memory);
  }

  return memoryCache.get(key);
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
      console.error("Error fetching chat history:", err);
      res.status(500).json({ error: "Failed to load history" });
    }
  },

  async addMessage(req, res) {
    const { user_id, model_id } = req.params;
    const { message, sender } = req.body;

    try {
      // Save user message to DB
      const newUserMsg = await ChatHistory.create({
        user_id,
        model_id,
        message,
        sender,
      });

      if (sender === "user") {
        // Load or create memory
        const memory = await initializeMemory(user_id, model_id);

        // Add user message to memory (LangChain won't auto-add input)
        await memory.chatHistory.addUserMessage(message);

        // Build LangChain chain with memory
        const model = new ChatOpenAI({
          modelName: "gpt-3.5-turbo",
          temperature: 0.7,
        });

        const chain = RunnableSequence.from([
          memory,
          model,
        ]);

        // Run chain — LangChain will auto-use + update memory
        const response = await chain.invoke({ input: message });

        const reply = response?.content || "Maaf, aku belum bisa menjawab.";

        // Save system reply to DB (LangChain does not store to DB!)
        const newSystemMsg = await ChatHistory.create({
          user_id,
          model_id,
          message: reply,
          sender: "system",
        });

        return res.status(201).json({ user: newUserMsg, system: newSystemMsg });
      }

      // If it's a non-user message (e.g., system preload), just store it
      return res.status(201).json(newUserMsg);
    } catch (err) {
      console.error("Error handling chat message:", err);
      res.status(500).json({ error: "Failed to process message" });
    }
  }
};

export default ChatHistoryController;
