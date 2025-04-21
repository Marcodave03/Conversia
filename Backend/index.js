// import express from "express";
// import cors from "cors";
// import http from "http";
// import dotenv from "dotenv";
// import sequelize from "./config/Database.js";
// import "./models/Association.js";
// import Route from "./route/Route.js";

// import { exec } from "child_process";
// import voice from "elevenlabs-node";
// import { promises as fs } from "fs";
// import OpenAI from "openai";


// dotenv.config();

// //API 
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
// });

// const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
// const voiceID = "kgG7dCoKCfLehAPWkJOE";




// const app = express();
// app.use(express.json());
// app.use(cors());
// const port = process.env.PORT;

// const server = http.createServer(app);

// app.use("/api/conversia",Route);

// //ELEVEN LABS API
// app.get("/voices", async (req, res) => {
//   try {
//     const voices = await voice.getVoices(elevenLabsApiKey);
//     res.send(voices);
//   } catch (err) {
//     console.error("Failed to fetch voices:", err.message);
//     res.status(500).send({ error: "Failed to fetch voices" });
//   }
// });



// if (!port) {
//   console.error("Port is not defined in the environment variables");
//   process.exit(1);
// }

// (async () => {
//   try {
//     await sequelize.sync( {alter: false} );
//     server.listen(port, () => {
//       console.log(`Server is running on port ${port}`);
//     }); 
//   } catch (error) {
//     console.error("Error starting server or seeding database:", error);
//     process.exit(1);
//   }
// })();



import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import sequelize from "./config/Database.js";
import "./models/Association.js";
import Route from "./route/Route.js";

import { exec } from "child_process";
import voice from "elevenlabs-node";
import { promises as fs } from "fs";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "kgG7dCoKCfLehAPWkJOE";

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

const server = http.createServer(app);

app.use("/api/conversia", Route);

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

  if (!userMessage) {
    return res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
  }

  if (!elevenLabsApiKey || openai.apiKey === "-") {
    return res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin Wawa Sensei with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Laughing",
        },
      ],
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a virtual girlfriend. You will always reply with a JSON array of messages. Each message has a text, facialExpression, and animation.`,
        },
        { role: "user", content: userMessage },
      ],
    });

    let messages = JSON.parse(completion.choices[0].message.content);
    if (messages.messages) messages = messages.messages;

    for (let i = 0; i < messages.length; i++) {
      // const message = messages[i];
      // const fileName = `audios/message_${i}.mp3`;
      // await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, message.text);
      // await lipSyncMessage(i);
      // message.audio = await audioFileToBase64(fileName);
      // message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
      const message = messages[0]; // send only the first message
      const fileName = `audios/response.mp3`;

      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, message.text);

      // optional: create lipsync if needed
      // await lipSyncMessage(0); // if needed

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", `attachment; filename="response.mp3"`);
      res.setHeader("X-Chat-Text", encodeURIComponent(message.text)); // optional text info
      fs.createReadStream(fileName).pipe(res);

    }

    res.send({ messages });
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).send({ error: "Chat generation failed." });
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
