import prisma from "../db/prisma.js";
import {
  getConversationContext,
} from "./conversation.service.js";
import {
  generateChatResponse,
} from "./ai.service.js";

/**
 * Process a chat message.
 */
export async function processChatMessage({
  userId,
  conversationId,
  message,
}) {
  // 1. Verify that the conversation belongs to the user.
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!conversation) {
    const error = new Error(
      "Conversation not found."
    );

    error.statusCode = 404;
    throw error;
  }

  // 2. Validate message.
  const cleanedMessage = message.trim();

  if (!cleanedMessage) {
    const error = new Error(
      "Message cannot be empty."
    );

    error.statusCode = 400;
    throw error;
  }

  // 3. Save user's message.
  const userMessage = await prisma.message.create({
    data: {
      conversationId,
      sender: "USER",
      text: cleanedMessage,
    },
  });

  // 4. Get recent conversation context.
  const context = await getConversationContext(
    userId,
    conversationId,
    20
  );

  // 5. Ask FastAPI for the AI response.
  const aiResult = await generateChatResponse({
    message: cleanedMessage,
    conversation: context,
  });

  // 6. Validate AI response.
  if (!aiResult?.reply) {
    const error = new Error(
      "AI service returned an invalid response."
    );

    error.statusCode = 502;
    throw error;
  }

  // 7. Save AI response.
  const aiMessage = await prisma.message.create({
    data: {
      conversationId,
      sender: "AI",
      text: aiResult.reply,
    },
  });

  // 8. Return everything required by the controller.
  return {
    userMessage,
    aiMessage,
    analysis: {
      sentiment: aiResult.sentiment ?? null,
      intent: aiResult.intent ?? null,
      riskLevel: aiResult.riskLevel ?? null,
    },
  };
}