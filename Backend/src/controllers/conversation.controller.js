import {
  createConversation,
  getUserConversations,
  getConversationById,
  updateConversation,
  deleteConversation,
  toggleConversationPin,
} from "../services/conversation.service.js";

/**
 * Get the authenticated user's database ID.
 *
 * authMiddleware.js attaches:
 *
 * req.user = {
 *   id,
 *   email,
 *   role,
 *   supabaseUser
 * }
 *
 * We only trust req.user.id.
 *
 * We do NOT accept userId from:
 * - req.body
 * - req.query
 *
 * This prevents the frontend from choosing
 * which user's data it wants to access.
 */
function getUserId(req) {
  return req.user?.id;
}

/**
 * POST /api/conversations
 *
 * Create a new conversation for
 * the authenticated user.
 */
export async function createConversationController(req, res) {
  try {
    const userId = getUserId(req);
    const { title } = req.body || {};

    // ------------------------------------------
    // Authentication check
    // ------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    // ------------------------------------------
    // Validate title
    // ------------------------------------------

    if (
      title !== undefined &&
      typeof title !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "title must be a string.",
      });
    }

    // ------------------------------------------
    // Create conversation
    // ------------------------------------------

    const conversation = await createConversation(
      userId,
      title
    );

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully.",
      data: conversation,
    });

  } catch (error) {
    console.error(
      "Create conversation error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to create conversation.",
    });
  }
}

/**
 * GET /api/conversations
 *
 * Get all conversations belonging
 * to the authenticated user.
 */
export async function getUserConversationsController(
  req,
  res
) {
  try {
    const userId = getUserId(req);

    // ------------------------------------------
    // Authentication check
    // ------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    // ------------------------------------------
    // Get conversations
    // ------------------------------------------

    const conversations =
      await getUserConversations(userId);

    return res.status(200).json({
      success: true,
      message:
        "Conversations fetched successfully.",
      data: conversations,
    });

  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch conversations.",
    });
  }
}

/**
 * GET /api/conversations/:conversationId
 *
 * Get a single conversation and
 * its messages.
 */
export async function getConversationController(
  req,
  res
) {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;

    // ------------------------------------------
    // Authentication check
    // ------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    // ------------------------------------------
    // Validate conversation ID
    // ------------------------------------------

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required.",
      });
    }

    // ------------------------------------------
    // Get conversation
    // ------------------------------------------

    const conversation =
      await getConversationById(
        userId,
        conversationId
      );

    return res.status(200).json({
      success: true,
      message:
        "Conversation fetched successfully.",
      data: conversation,
    });

  } catch (error) {
    console.error(
      "Get conversation error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch conversation.",
    });
  }
}

/**
 * PATCH /api/conversations/:conversationId
 *
 * Update the title of a conversation.
 */
export async function updateConversationController(
  req,
  res
) {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;
    const { title } = req.body || {};

    // ------------------------------------------
    // Authentication check
    // ------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    // ------------------------------------------
    // Validate conversation ID
    // ------------------------------------------

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required.",
      });
    }

    // ------------------------------------------
    // Validate title
    // ------------------------------------------

    if (
      typeof title !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid title is required.",
      });
    }

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty.",
      });
    }

    // ------------------------------------------
    // Update conversation
    // ------------------------------------------

    const conversation =
      await updateConversation(
        userId,
        conversationId,
        trimmedTitle
      );

    return res.status(200).json({
      success: true,
      message:
        "Conversation updated successfully.",
      data: conversation,
    });

  } catch (error) {
    console.error(
      "Update conversation error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update conversation.",
    });
  }
}

/**
 * PATCH /api/conversations/:conversationId/pin
 *
 * Pin or unpin a conversation.
 */
export async function toggleConversationPinController(
  req,
  res
) {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;
    const { isPinned } = req.body || {};

    // ------------------------------------------
    // Authentication check
    // ------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user is required.",
      });
    }

    // ------------------------------------------
    // Validate conversation ID
    // ------------------------------------------

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message:
          "conversationId is required.",
      });
    }

    // ------------------------------------------
    // Validate pin value
    // ------------------------------------------

    if (typeof isPinned !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "isPinned must be a boolean.",
      });
    }

    // ------------------------------------------
    // Update pin state
    // ------------------------------------------

    const conversation =
      await toggleConversationPin(
        userId,
        conversationId,
        isPinned
      );

    return res.status(200).json({
      success: true,
      message: isPinned
        ? "Conversation pinned successfully."
        : "Conversation unpinned successfully.",
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Toggle conversation pin error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update conversation pin.",
    });
  }
}

/**
 * DELETE /api/conversations/:conversationId
 *
 * Delete a conversation belonging
 * to the authenticated user.
 */
export async function deleteConversationController(
  req,
  res
) {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;

    // ------------------------------------------
    // Authentication check
    // ------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    // ------------------------------------------
    // Validate conversation ID
    // ------------------------------------------

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required.",
      });
    }

    // ------------------------------------------
    // Delete conversation
    // ------------------------------------------

    await deleteConversation(
      userId,
      conversationId
    );

    return res.status(200).json({
      success: true,
      message:
        "Conversation deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete conversation error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to delete conversation.",
    });
  }
}