import express from "express";
import { getProfileController, updateProfileController } from "../controllers/profile.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", getProfileController);
router.put("/", updateProfileController);

export default router;
