import express from "express";

import {
  createMoodController,
  getUserMoodsController,
  getMoodController,
  updateMoodController,
  deleteMoodController,
} from "../controllers/mood.controller.js";

import {
  authMiddleware,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Create mood entry
 */
router.post(
  "/",
  authMiddleware,
  createMoodController
);

/**
 * Get all moods for current user
 */
router.get(
  "/",
  authMiddleware,
  getUserMoodsController
);

/**
 * Get one mood
 */
router.get(
  "/:moodId",
  authMiddleware,
  getMoodController
);

/**
 * Update mood
 */
router.patch(
  "/:moodId",
  authMiddleware,
  updateMoodController
);

/**
 * Delete mood
 */
router.delete(
  "/:moodId",
  authMiddleware,
  deleteMoodController
);

export default router;