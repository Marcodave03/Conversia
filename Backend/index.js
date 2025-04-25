import dotenv from "dotenv";
dotenv.config();

console.log("ENV CHECK:", {
  OPENAI: process.env.OPENAI_API_KEY,
  ELEVEN: process.env.ELEVEN_LABS_API_KEY
});

import express from "express";
import cors from "cors";
import http from "http";
import sequelize from "./config/Database.js";
import "./models/Association.js";
import Route from "./route/Route.js";
import { exec } from "child_process";
import voice from "elevenlabs-node";
import { promises as fs } from "fs";
import OpenAI from "openai";
// import fetch from "node-fetch";




const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "21m00Tcm4TlvDq8ikWAM";

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

const server = http.createServer(app);

app.use("/api/conversia", Route);
app.use('/audios', express.static('audios'));


// Helper Functions
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  await execCommand(`ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`);
  await execCommand(`./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`);
};

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

// ElevenLabs: Get available voices
async function elevenLabsTTS(apiKey, voiceId, text, outputFile) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed TTS: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(outputFile, buffer);
}


app.get("/voices", async (req, res) => {
  try {
    const voices = await voice.getVoices(elevenLabsApiKey);
    res.send(voices);
  } catch (err) {
    console.error("Failed to fetch voices:", err.message);
    res.status(500).send({ error: "Failed to fetch voices" });
  }
});

// Chat + Voice Route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const debug = {
    openai: null,
    elevenlabs: null,
    message: null,
    audioBase64: null,
    lipsync: null,
    error: null,
  };

  if (!userMessage) {
    return res.status(400).send({ error: "No message provided." });
  }

  if (!elevenLabsApiKey || !process.env.OPENAI_API_KEY) {
    return res.status(500).send({ error: "Missing API keys." });
  }

  try {
    // === 1. CHATGPT COMPLETION ===
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a virtual girlfriend. Reply with a JSON object containing text, facialExpression, and animation properties.`,
        },
        { role: "user", content: userMessage },
      ],
    });

    const response = JSON.parse(completion.choices[0].message.content);
    debug.message = response;
    debug.openai = "success";

    // === 2. TEXT TO SPEECH ===
    const fileName = `audios/response.mp3`;
    const wavFileName = `audios/response.wav`;
    const lipsyncFileName = `audios/response.json`;
    
    try {
      // Generate speech
      await elevenLabsTTS(elevenLabsApiKey, voiceID, response.text, fileName);
      
      // Convert to WAV for rhubarb
      await execCommand(`ffmpeg -y -i ${fileName} ${wavFileName}`);
      
      // Generate lipsync data
      await execCommand(`./bin/rhubarb -f json -o ${lipsyncFileName} ${wavFileName} -r phonetic`);
      
      // Read lipsync data
      const lipsyncData = await readJsonTranscript(lipsyncFileName);
      
      debug.audioBase64 = await audioFileToBase64(fileName);
      debug.lipsync = lipsyncData;
      debug.elevenlabs = "success";
      
      // Send response with all needed data
      res.send({
        message: {
          text: response.text,
          facialExpression: response.facialExpression || "default",
          animation: response.animation || "Idle",
          lipsync: lipsyncData,
          audio: debug.audioBase64
        }
      });
    } catch (err) {
      console.error("TTS/Lipsync failed:", err);
      debug.elevenlabs = "failed";
      debug.error = `TTS/Lipsync Error: ${err.message}`;
      res.status(500).send(debug);
    }
  } catch (err) {
    console.error("Error in /chat:", err);
    debug.openai = "failed";
    debug.error = `OpenAI Error: ${err.message}`;
    res.status(500).send(debug);
  }
});


if (!port) {
  console.error("Port is not defined in the environment variables");
  process.exit(1);
}

(async () => {
  try {
    await sequelize.sync({ alter: false });
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server or syncing database:", error);
    process.exit(1);
  }
})();
