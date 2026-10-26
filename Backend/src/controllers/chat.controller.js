import {
  processChatMessage,
} from "../services/chat.service.js";

const MAX_MESSAGE_LENGTH = 4000;


export async function sendMessageController(
  req,
  res
) {

  try {

    // ==========================================
    // 1. Get authenticated user
    // ==========================================

    const userId = req.user?.id;


    // ==========================================
    // 2. Read request body
    // ==========================================

    const {
      conversationId,
      message,
    } = req.body || {};


    // ==========================================
    // 3. Authentication check
    // ==========================================

    if (!userId) {

      return res.status(401).json({
        success: false,
        message:
          "Authenticated user is required.",
      });
    }


    // ==========================================
    // 4. Conversation validation
    // ==========================================

    if (!conversationId) {

      return res.status(400).json({
        success: false,
        message:
          "conversationId is required.",
      });
    }


    // ==========================================
    // 5. Message validation
    // ==========================================

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "A valid message is required.",
      });
    }

    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
      });
    }


    // ==========================================
    // 6. Process chat
    // ==========================================

    const result =
      await processChatMessage({
        userId,
        conversationId,
        message,
      });


    // ==========================================
    // 7. Return response
    // ==========================================

    return res.status(200).json({
      success: true,

      message:
        "Chat response generated successfully.",

      data: result,
    });


  } catch (error) {

    console.error(
      "Send message error:",
      error
    );


    return res.status(
      error.statusCode || 500
    ).json({

      success: false,

      message:
        error.message ||
        "Failed to process chat message.",
    });
  }
}