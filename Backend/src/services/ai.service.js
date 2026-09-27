import axios from "axios";


const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:8000";


/**
 * Convert Prisma conversation messages
 * into the format expected by FastAPI.
 *
 * Prisma:
 * USER
 * ASSISTANT
 *
 * FastAPI:
 * user
 * assistant
 */
function buildHistory(conversation = []) {

  return conversation
    .filter(
      (item) =>
        item.sender === "USER" ||
        item.sender === "ASSISTANT"
    )
    .map((item) => ({
      role:
        item.sender === "USER"
          ? "user"
          : "assistant",

      content: item.text,
    }));
}


/**
 * Send a message and conversation history
 * to the FastAPI AI service.
 */
export async function generateChatResponse({
  message,
  conversation,
}) {

  try {

    const history =
      buildHistory(conversation);


    const response = await axios.post(
      `${AI_SERVICE_URL}/api/v1/chat`,
      {
        message,
        history,
      },
      {
        timeout: 60000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );


    const data = response.data;


    if (!data?.reply) {

      throw new Error(
        "FastAPI returned an empty AI response."
      );
    }


    /*
     * Convert FastAPI snake_case fields
     * into the camelCase structure used
     * by the Node backend.
     */

    return {

      reply: data.reply,

      intent:
        data.intent ?? null,

      sentiment:
        data.sentiment ?? null,

      riskLevel:
        data.risk_level ?? "low",

      action:
        data.action ?? "normal",

      emotion:
        data.emotion ?? null,

      sentimentScore:
        data.sentiment_score ?? null,

      emotionScore:
        data.emotion_score ?? null,

      riskScore:
        data.risk_score ?? null,

      confidence:
        data.confidence ?? null,

      rawResponse:
        data,
    };


  } catch (error) {

    console.error(
      "AI service error:",
      error.response?.data ||
      error.message
    );


    /*
     * Preserve an existing application error.
     */

    if (
      error.statusCode
    ) {
      throw error;
    }


    const aiError = new Error(
      "AI service is currently unavailable."
    );

    aiError.statusCode = 503;

    throw aiError;
  }
}