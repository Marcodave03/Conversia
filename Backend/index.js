import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { exec } from "child_process";
import { promises as fs } from "fs";
import sequelize from "./config/Database.js";
import "./models/Association.js";
import Route from "./route/Route.js";
import voice from "elevenlabs-node";
import OpenAI from "openai";
import path from "path";

// Validate ENV setup
console.log("ENV CHECK:", {
  OPENAI: process.env.OPENAI_API_KEY,
  ELEVEN: process.env.ELEVEN_LABS_API_KEY
});

// Initialize APIs
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "21m00Tcm4TlvDq8ikWAM";

// Initialize server
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;
const server = http.createServer(app);

// Static files
app.use("/audios", express.static("audios"));
app.use("/api/conversia", Route);

// ---------- Helper Utilities ----------

const execCommand = (command) => new Promise((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${command}`, error);
      return reject(error);
    }
    if (stderr) console.warn(`Execution stderr: ${stderr}`);
    resolve(stdout);
  });
});

const elevenLabsTTS = async (apiKey, voiceId, text, outputFile) => {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: { stability: 0.5, similarity_boost: 0.5 }
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ElevenLabs TTS failed: ${response.status} - ${errorBody}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputFile, buffer);
};

const generateLipSyncData = async (inputMp3File, wavFile, jsonFile) => {
  const rhubarbPath = path.resolve("bin", "rhubarb", "rhubarb");
  await execCommand(`ffmpeg -y -i ${inputMp3File} ${wavFile}`);
  await execCommand(`${rhubarbPath} -f json -o ${jsonFile} ${wavFile} -r phonetic`);
};


const readJsonFile = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
};

const encodeFileToBase64 = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  return fileBuffer.toString("base64");
};

// ---------- Routes ----------

// Get available ElevenLabs voices
app.get("/voices", async (req, res) => {
  try {
    const voices = await voice.getVoices(elevenLabsApiKey);
    res.json(voices);
  } catch (err) {
    console.error("Failed fetching voices:", err);
    res.status(500).json({ error: "Failed to fetch voices" });
  }
});

// Chat, TTS, Lipsync pipeline
app.post("/chat", async (req, res) => {
  const { message: userMessage } = req.body;
  const debug = { openai: null, elevenlabs: null, message: null, audioBase64: null, lipsync: null, error: null };

  if (!userMessage) return res.status(400).send({ error: "No message provided." });
  if (!elevenLabsApiKey || !process.env.OPENAI_API_KEY) return res.status(500).send({ error: "Missing API keys." });

  try {
    // 1. OpenAI Chat Completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      temperature: 0.6,
      max_tokens: 1000,
      messages: [
        { role: "system", content: "You are a virtual girlfriend. Reply with JSON {text, facialExpression, animation}." },
        { role: "user", content: userMessage }
      ]
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    debug.message = aiResponse;
    debug.openai = "success";

    const filePathMp3 = `audios/response.mp3`;
    const filePathWav = `audios/response.wav`;
    const filePathJson = `audios/response.json`;

    // 2. ElevenLabs TTS
    await elevenLabsTTS(elevenLabsApiKey, voiceID, aiResponse.text, filePathMp3);

    // 3. WAV Conversion and LipSync Generation
    await generateLipSyncData(filePathMp3, filePathWav, filePathJson);

    // 4. Read Generated LipSync JSON
    const lipSyncData = await readJsonFile(filePathJson);

    // 5. Encode Audio for Frontend
    const audioBase64 = await encodeFileToBase64(filePathMp3);

    debug.elevenlabs = "success";
    debug.audioBase64 = audioBase64;
    debug.lipsync = lipSyncData;

    // Respond
    res.json({
      message: {
        text: aiResponse.text,
        facialExpression: aiResponse.facialExpression || "default",
        animation: aiResponse.animation || "Idle",
        lipsync: lipSyncData,
        audio: audioBase64
      }
    });

  } catch (err) {
    console.error("Chat pipeline failure:", err);
    debug.error = err.message;
    res.status(500).send(debug);
  }
});

// ---------- Server Bootstrap ----------

if (!port) {
  console.error("Critical Error: PORT not defined in environment variables.");
  process.exit(1);
}

(async () => {
  try {
    await sequelize.sync({ alter: false });
    server.listen(port, () => {
      console.log(`✅ Server operational at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed starting server or syncing database:", err);
    process.exit(1);
  }
})();
