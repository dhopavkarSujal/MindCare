import prisma from "../db/prisma.js";

import {
  getConversationContext,
} from "./conversation.service.js";

import {
  generateChatResponse,
} from "./ai.service.js";


/**
 * Convert FastAPI risk level into
 * the Prisma RiskLevel enum.
 */
function normalizeRiskLevel(
  riskLevel
) {

  switch (
    String(riskLevel || "")
      .toLowerCase()
  ) {

    case "high":
      return "HIGH";

    case "medium":
      return "MEDIUM";

    default:
      return "LOW";
  }
}


/**
 * Process a complete chat interaction.
 *
 * Flow:
 *
 * 1. Verify conversation ownership
 * 2. Get previous context
 * 3. Save USER message
 * 4. Call FastAPI
 * 5. Save ASSISTANT message
 * 6. Save AnalysisLog
 * 7. Update conversation timestamp
 * 8. Return result
 */
export async function processChatMessage({

  userId,

  conversationId,

  message,

}) {

  // ==========================================
  // 1. VERIFY CONVERSATION OWNERSHIP
  // ==========================================

  const conversation =
    await prisma.conversation.findFirst({

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


  // ==========================================
  // 2. CLEAN MESSAGE
  // ==========================================

  const cleanedMessage =
    message.trim();


  if (!cleanedMessage) {

    const error = new Error(
      "Message cannot be empty."
    );

    error.statusCode = 400;

    throw error;
  }


  // ==========================================
  // 3. GET PREVIOUS CONTEXT
  // ==========================================
  //
  // IMPORTANT:
  // We get context BEFORE saving the current
  // message, because FastAPI will receive
  // the current message separately.
  //
  // This prevents the current message from
  // being duplicated in the AI context.
  // ==========================================

  const context =
    await getConversationContext(
      userId,
      conversationId,
      20
    );


  // ==========================================
  // 4. SAVE USER MESSAGE
  // ==========================================

  const userMessage =
    await prisma.message.create({

      data: {

        conversationId,

        sender: "USER",

        text: cleanedMessage,
      },
    });


  // ==========================================
  // 5. CALL FASTAPI AI SERVICE
  // ==========================================

  const aiResult =
    await generateChatResponse({

      message: cleanedMessage,

      conversation: context,
    });


  // ==========================================
  // 6. VALIDATE AI RESPONSE
  // ==========================================

  if (
    !aiResult ||
    !aiResult.reply
  ) {

    const error = new Error(
      "AI service returned an invalid response."
    );

    error.statusCode = 502;

    throw error;
  }


  // ==========================================
  // 7. SAVE AI MESSAGE
  // ==========================================
  //
  // IMPORTANT:
  // Prisma enum is ASSISTANT, not AI.
  // ==========================================

  const aiMessage =
    await prisma.message.create({

      data: {

        conversationId,

        sender: "ASSISTANT",

        text: aiResult.reply,
      },
    });


  // ==========================================
  // 8. SAVE AI ANALYSIS
  // ==========================================

  const riskLevel =
    normalizeRiskLevel(
      aiResult.riskLevel
    );


  const isCrisis =
    aiResult.action === "crisis" ||
    riskLevel === "HIGH";


  const analysis =
    await prisma.analysisLog.create({

      data: {

        messageId:
          aiMessage.id,

        sentiment:
          aiResult.sentiment ||
          "unknown",

        /*
         * Emotion is not yet returned by
         * the current FastAPI service.
         *
         * "unknown" is intentional rather
         * than inventing an emotion result.
         *
         * We will replace this after the
         * emotion layer is implemented.
         */
        emotion:
          aiResult.emotion ||
          "unknown",

        intent:
          aiResult.intent ||
          "general",

        riskLevel,

        isCrisis,

        sentimentScore:
          aiResult.sentimentScore,

        emotionScore:
          aiResult.emotionScore,

        riskScore:
          aiResult.riskScore,

        confidence:
          aiResult.confidence,

        rawResponse:
          aiResult.rawResponse,
      },
    });


  // ==========================================
  // 9. UPDATE CONVERSATION TIMESTAMP
  // ==========================================

  await prisma.conversation.update({

    where: {
      id: conversationId,
    },

    data: {
      updatedAt: new Date(),
    },
  });


  // ==========================================
  // 10. RETURN RESULT
  // ==========================================

  return {

    userMessage,

    aiMessage,

    analysis,

    action:
      aiResult.action,

    riskLevel:
      aiResult.riskLevel,

    intent:
      aiResult.intent,

    sentiment:
      aiResult.sentiment,
  };
}