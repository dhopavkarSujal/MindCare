import express from "express";

import {
  sendMessageController,
} from "../controllers/chat.controller.js";

import {
  authMiddleware,
} from "../middleware/auth.middleware.js";


const router = express.Router();


router.post(
  "/",
  authMiddleware,
  sendMessageController
);


export default router;