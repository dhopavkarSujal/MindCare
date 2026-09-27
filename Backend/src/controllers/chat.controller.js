import {
  processChatMessage,
} from "../services/chat.service.js";

export async function sendMessageController(req, res) {
  try {
    const userId =
      req.user?.id ||
      req.body.userId;

    const {
      conversationId,
      message,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required.",
      });
    }

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid message is required.",
      });
    }

    const result = await processChatMessage({
      userId,
      conversationId,
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Chat response generated successfully.",
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