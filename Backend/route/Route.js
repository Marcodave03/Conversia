import express from "express";
import { CreateUser, GetUser, UpdateUser } from "../controller/UserController.js";
import AvatarController from "../controller/AvatarController.js";
import BackgroundController from "../controller/BackgroundController.js";

const router = express.Router();

// User Routes
router.post("/users", CreateUser);
router.get("/users/:user_id", GetUser);
router.put("/users/:user_id", UpdateUser);

// Avatar Routes
router.post("/users/:user_id/avatars", AvatarController.createAvatar);
router.get("/users/:user_id/avatars", AvatarController.getAvatarsByUser);
router.get("/avatars/:id", AvatarController.getAvatarById);

router.post("/users/:user_id/background", BackgroundController.createBackground);
router.get("/background", BackgroundController.getAllBackgrounds);
router.get("/users/:user_id/background", BackgroundController.getBackgroundsByUser);
router.get("/background/:id", BackgroundController.getBackgroundById);


export default router;
