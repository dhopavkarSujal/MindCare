import express from "express";

import {
  createConversationController,
  getUserConversationsController,
  getConversationController,
  updateConversationController,
  toggleConversationPinController,
  deleteConversationController,
} from "../controllers/conversation.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

/*
 * All conversation routes require authentication.
 *
 * authMiddleware verifies the Supabase access token
 * and attaches the authenticated application user to:
 *
 * req.user
 */

router.use(authMiddleware);

/**
 * POST /api/conversations
 *
 * Create a new conversation.
 */
router.post(
  "/",
  createConversationController
);

/**
 * GET /api/conversations
 *
 * Get all conversations for
 * the authenticated user.
 */
router.get(
  "/",
  getUserConversationsController
);

/**
 * GET /api/conversations/:conversationId
 *
 * Get one conversation with its messages.
 */
router.get(
  "/:conversationId",
  getConversationController
);

/**
 * PATCH /api/conversations/:conversationId/pin
 *
 * Pin or unpin a conversation.
 */
router.patch(
  "/:conversationId/pin",
  toggleConversationPinController
);

/**
 * PATCH /api/conversations/:conversationId
 *
 * Rename/update conversation title.
 */
router.patch(
  "/:conversationId",
  updateConversationController
);

/**
 * DELETE /api/conversations/:conversationId
 *
 * Delete a conversation.
 */
router.delete(
  "/:conversationId",
  deleteConversationController
);

/*
 * IMPORTANT:
 * This is a DEFAULT export.
 *
 * app.js imports it using:
 *
 * import conversationRoutes
 *   from "./routes/conversation.routes.js";
 */

export default router;