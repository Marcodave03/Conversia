import express from "express";
import { signer } from "../sui/suiClient.js";

const router = express.Router();

router.post("/mint-avatar", async (req, res) => {
  try {
    const { recipient, name, imageUrl } = req.body;

    const tx = await signer.executeMoveCall({
      packageObjectId: process.env.SUI_PACKAGE_ID,
      module: process.env.SUI_MODULE,
      function: process.env.SUI_FUNCTION,
      arguments: [recipient, name, imageUrl],
      gasBudget: 10000,
    });

    res.json({ status: "success", transaction: tx });
  } catch (err) {
    console.error("❌ Minting Failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
