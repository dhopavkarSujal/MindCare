import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  async (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Authentication successful.",
      data: {
        user: req.user,
      },
    });
  }
);

export default router;