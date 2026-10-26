import express from "express";
import { getConsentsController, updateConsentController } from "../controllers/consent.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", getConsentsController);
router.post("/", updateConsentController);

export default router;
