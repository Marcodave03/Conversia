import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import sequelize from "./config/Database.js";
import "./models/Association.js";
import Route from "./route/Route.js";


dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/conversia",Route);

const port = process.env.PORT;
if (!port) {
  console.error("Port is not defined in the environment variables");
  process.exit(1);
}

(async () => {
  try {
    await sequelize.sync( {alter: false} );
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    }); 
  } catch (error) {
    console.error("Error starting server or seeding database:", error);
    process.exit(1);
  }
})();
