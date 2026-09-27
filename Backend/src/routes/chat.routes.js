import express from "express";

import {
  sendMessageController,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post(
  "/",
  sendMessageController
);

export default router;