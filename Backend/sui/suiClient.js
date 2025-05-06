import {
  Ed25519Keypair,
  RawSigner,
  JsonRpcProvider,
  Connection,
} from "@mysten/sui.js";
import { fromB64 } from "@mysten/bcs";
import dotenv from "dotenv";
dotenv.config();

const privateKeyArray = JSON.parse(process.env.SUI_PRIVATE_KEY); // already an array
const keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));

const provider = new JsonRpcProvider(
  new Connection({ fullnode: process.env.SUI_RPC_ENDPOINT })
);

const signer = new RawSigner(keypair, provider);

export { signer, provider };
