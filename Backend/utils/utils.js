app.get("/voices", async (req, res) => {
    try {
      const voices = await voice.getVoices(elevenLabsApiKey);
      res.send(voices);
    } catch (err) {
      console.error("Failed to fetch voices:", err.message);
      res.status(500).send({ error: "Failed to fetch voices" });
    }
  });
  