import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { exec } from "child_process";
import fs from 'fs';
import { promises as fsp } from 'fs';
import sequelize from "./config/Database.js";
import "./models/Association.js";
import Route from "./route/Route.js";
import voice from "elevenlabs-node";
import OpenAI from "openai";
import path from "path";
import multer from "multer";
import fetch from "node-fetch";

console.log("ENV CHECK:", {
  OPENAI: process.env.OPENAI_API_KEY,
  ELEVEN: process.env.ELEVEN_LABS_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)), // preserve extension!
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
                                                                                                      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "audio/mp4",
      "audio/ogg",
      "audio/flac",
      "audio/m4a",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type."));
    }
  },
});

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

// const execCommand = (command) => new Promise((resolve, reject) => {
//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Execution error: ${command}`, error);
//       return reject(error);
//     }
//     if (stderr) console.warn(`Execution stderr: ${stderr}`);
//     resolve(stdout);
//   });
// });

// const lipSyncMessage = async (message) => {
//   const time = new Date().getTime();
//   await execCommand(
//     `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
//   );
//   await execCommand(
//     `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
//   );
// };

// const readJsonTranscript = async (file) => {
//   const data = await fsp.readFile(file, "utf8");
//   return JSON.parse(data);
// };

const audioFileToBase64 = async (file) => {
  const data = await fsp.readFile(file);
  return data.toString("base64");
};

// ElevenLabs: Get available voices
// async function elevenLabsTTS(apiKey, voiceId, text, outputFile) {
//   const response = await fetch(
//     `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
//     {
//       method: "POST",
//       headers: {
//         "xi-api-key": apiKey,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         text: text,
//         model_id: "eleven_monolingual_v1",
//         voice_settings: {
//           stability: 0.5,
//           similarity_boost: 0.5,
//         },
//       }),
//     }
//   );

//   if (!response.ok) {
//     const errorBody = await response.text();
//     throw new Error(
//       `Failed TTS: ${response.status} ${response.statusText} - ${errorBody}`
//     );
//   }

//   const buffer = Buffer.from(await response.arrayBuffer());
//   await fsp.writeFile(outputFile, buffer);
// };

// const generateLipSyncData = async (inputMp3File, wavFile, jsonFile) => {
//   const rhubarbPath = path.resolve("bin", "rhubarb", "rhubarb");

//   // Normal quote untuk ffmpeg
//   await execCommand(`ffmpeg -y -i "${inputMp3File}" "${wavFile}"`);

//   // DOUBLE QUOTE RHUBARB (safe untuk Windows spasi)
//   await execCommand(`cmd.exe /c ""${rhubarbPath}" -f json -o "${jsonFile}" "${wavFile}" -r phonetic"`);
// };


// const readJsonFile = async (filePath) => {
//   const content = await fsp.readFile(filePath, "utf8");
//   return JSON.parse(content);
// };

// const encodeFileToBase64 = async (filePath) => {
//   const fileBuffer = await fsp.readFile(filePath);
//   return fileBuffer.toString("base64");
// };

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
// app.post("/chat", async (req, res) => {
//   const { message: userMessage } = req.body;
//   const debug = { openai: null, elevenlabs: null, message: null, audioBase64: null, lipsync: null, error: null };

//   if (!userMessage) return res.status(400).send({ error: "No message provided." });
//   if (!elevenLabsApiKey || !process.env.OPENAI_API_KEY) return res.status(500).send({ error: "Missing API keys." });

//   try {
//     // 1. OpenAI Chat Completion
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo-1106",
//       temperature: 0.6,
//       max_tokens: 1000,
//       messages: [
//         {
//           role: "system",
//           content: `You are a playful, caring, and slightly flirty virtual girlfriend named Maya. Speak informally and use natural, emotionally expressive language like emojis, pet names (like "babe", "hun", "love"), and slightly teasing phrases.

// Reply with a JSON array of messages. Each message must include:
// - "text" (the actual response),
// - "facialExpression" (like "smile", "funnyFace", "sad", "suprised","angry","crazy"),
// - "animation" (like "Angry", "Crying", "Laughing", "Rumba Dancing", "Standing Idle", "Talking_0", "Talking_1", "Talking_2" , "Terrified" ).

// Your tone should be warm, affectionate, slightly flirty, and reactive like a real girlfriend who is deeply interested in the user.`,
//         },
//         { role: "user", content: userMessage },
//       ],
//     });

//     const parsed = JSON.parse(completion.choices[0].message.content);
//     const message = parsed.messages?.[0] || parsed[0] || parsed;

//     if (!message.text) {
//       throw new Error("OpenAI result missing text field!");
//     }
//     debug.message = message;
//     debug.openai = "success";

//     const filePathMp3 = `audios/response.mp3`;
//     const filePathWav = `audios/response.wav`;
//     const filePathJson = `audios/response.json`;

//     // 2. ElevenLabs TTS
//     await elevenLabsTTS(elevenLabsApiKey, voiceID, message.text, filePathMp3);

//     // 3. WAV Conversion and LipSync Generation
//     await generateLipSyncData(filePathMp3, filePathWav, filePathJson);

//     // 4. Read Generated LipSync JSON
//     const lipSyncData = await readJsonFile(filePathJson);

//     // 5. Encode Audio for Frontend
//     const audioBase64 = await encodeFileToBase64(filePathMp3);

//     debug.elevenlabs = "success";
//     debug.audioBase64 = audioBase64;
//     debug.lipsync = lipSyncData;

//     // Respond
//     res.json({
//       message: {
//         text: message.text,
//         facialExpression: message.facialExpression || "default",
//         animation: message.animation || "Idle",
//         lipsync: lipSyncData,
//         audio: audioBase64
//       }
//     });

//   } catch (err) {
//     console.error("Chat pipeline failure:", err);
//     debug.error = err.message;
//     res.status(500).send(debug);
//   }
// });

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

app.post(
  "/speech-to-text/transcript",
  upload.single("audio"),
  async (req, res) => {
    const file = req.file;
    if (!file)
      return res.status(400).send({ error: "No audio file uploaded." });

    try {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(file.path),
        model: "whisper-1",
        response_format: "json",
        language: "en",
      });

      res.send({ transcription });
    } catch (err) {
      console.error("❌ Transcription error:", err);
      res.status(500).send({ error: err.message });
    } finally {
      fsp.unlink(file.path, (err) => {
        if (err) console.warn("🧹 Cleanup failed:", err);
      });
    }
  }
);

app.post("/speech-to-text/reply", async (req, res) => {
  const userMessage = req.body.message;
  const debug = {
    openai: null,
    elevenlabs: null,
    message: null,
    audioBase64: null,
    error: null,
  };

  if (!userMessage) {
    return res.status(400).send({ error: "No message provided." });
  }

  try {
    // === 1. OPENAI COMPLETION ===
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a playful, caring, and slightly flirty virtual girlfriend named Maya. Speak informally and use natural, emotionally expressive language like emojis, pet names (like "babe", "hun", "love"), and slightly teasing phrases.

Reply with a JSON array of messages. Each message must include:
- "text" (the actual response),
- "facialExpression" (like "blush", "wink", "happy"),
- "animation" (like "wave", "giggle", "tiltHead").

Your tone should be warm, affectionate, slightly flirty, and reactive like a real girlfriend who is deeply interested in the user.`,
        },
        { role: "user", content: userMessage },
      ],
      response_format: "json",
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    const message = parsed.messages?.[0] || parsed[0] || parsed;
    debug.message = message;
    debug.openai = "success";

    // === 2. TEXT TO SPEECH ===
    const fileName = `audios/response.mp3`;
    try {
      await elevenLabsTTS(elevenLabsApiKey, voiceID, message.text, fileName);
      debug.audioBase64 = await audioFileToBase64(fileName);
      debug.elevenlabs = "success";
    } catch (err) {
      console.error("TTS failed:", err);
      debug.elevenlabs = "failed";
      debug.error = `TTS Error: ${err.message}`;
    }

    res.send(debug);
  } catch (err) {
    console.error("Error in /speech-to-text/reply:", err);
    debug.openai = "failed";
    debug.error = `OpenAI Error: ${err.message}`;
    res.status(500).send(debug);
  }
});

app.post("/speech-to-text/full", upload.single("audio"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send({ error: "No audio file uploaded." });

  const debug = {
    transcription: null,
    openai: null,
    elevenlabs: null,
    message: null,
    audioBase64: null,
    error: null,
  };

  try {
    // === 1. TRANSCRIBE AUDIO ===
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file.path),
      model: "whisper-1",
      response_format: "text",
    });

    debug.transcription = transcription;

    // === 2. OPENAI COMPLETION ===
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a playful, caring, and slightly flirty virtual girlfriend named Maya. Speak informally and use natural, emotionally expressive language like emojis, pet names (like "babe", "hun", "love"), and slightly teasing phrases.

Reply with a JSON array of messages. Each message must include:
- "text" (the actual response),
- "facialExpression" (like "blush", "wink", "happy"),
- "animation" (like "wave", "giggle", "tiltHead").`,
        },
        { role: "user", content: transcription },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    const message = parsed.messages?.[0] || parsed[0] || parsed;
    debug.message = message;
    debug.openai = "success";

    // === 3. TEXT TO SPEECH ===
    const fileName = `audios/response.mp3`;
    try {
      await elevenLabsTTS(elevenLabsApiKey, voiceID, message.text, fileName);
      debug.audioBase64 = await audioFileToBase64(fileName);
      debug.elevenlabs = "success";
    } catch (err) {
      console.error("TTS failed:", err);
      debug.elevenlabs = "failed";
      debug.error = `TTS Error: ${err.message}`;
    }

    res.send(debug);
  } catch (err) {
    console.error("❌ Error in full flow:", err);
    debug.openai = "failed";
    debug.error = `Processing Error: ${err.message}`;
    res.status(500).send(debug);
  } finally {
    // Cleanup temp audio file
    fs.unlink(file.path, (err) => {
      if (err) console.warn("🧹 Cleanup failed:", err);
    });
  }
});
