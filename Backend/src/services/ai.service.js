import axios from "axios";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Send a message and conversation context
 * to the FastAPI AI service.
 */
export async function generateChatResponse({
  message,
  conversation,
}) {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/chat`,
      {
        message,
        conversation,
      },
      {
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI service error:",
      error.response?.data || error.message
    );

    const aiError = new Error(
      "AI service is currently unavailable."
    );

    aiError.statusCode = 503;

    throw aiError;
  }
}