import prisma from "../db/prisma.js";

/**
 * Check whether the user exists.
 */
async function ensureUserExists(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  return user;
}

/**
 * Create a new conversation.
 */
export async function createConversation(userId, title) {
  const user = await ensureUserExists(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: title?.trim() || "New Support Session",
    },
  });

  return conversation;
}

/**
 * Get all conversations belonging to a user.
 *
 * Most recently updated conversations appear first.
 */
export async function getUserConversations(userId) {
  const user = await ensureUserExists(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
    },
    orderBy: [
        {
          isPinned: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  return conversations;
}

/**
 * Get one conversation belonging to a specific user.
 *
 * Messages are returned in chronological order.
 */
export async function getConversationById(userId, conversationId) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          sender: true,
          text: true,
          createdAt: true,
        },
      },
    },
  });

  if (!conversation) {
    const error = new Error("Conversation not found.");
    error.statusCode = 404;
    throw error;
  }

  return conversation;
}

/**
 * Update conversation title.
 */
export async function updateConversation(
  userId,
  conversationId,
  title
) {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!existingConversation) {
    const error = new Error("Conversation not found.");
    error.statusCode = 404;
    throw error;
  }

  const conversation = await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      title: title.trim(),
    },
  });

  return conversation;
}

/**
 * Delete a conversation.
 */
export async function deleteConversation(userId, conversationId) {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!existingConversation) {
    const error = new Error("Conversation not found.");
    error.statusCode = 404;
    throw error;
  }

  await prisma.conversation.delete({
    where: {
      id: conversationId,
    },
  });

  return true;
}

/**
 * Pin or unpin a conversation.
 */
export async function toggleConversationPin(
  userId,
  conversationId,
  isPinned
) {
  const existingConversation =
    await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      select: {
        id: true,
      },
    });

  if (!existingConversation) {
    const error = new Error(
      "Conversation not found."
    );

    error.statusCode = 404;

    throw error;
  }

  return prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      isPinned,
    },
  });
}

/**
 * Get recent conversation messages for the chatbot.
 *
 * This function is intentionally not exposed as an API route yet.
 * chat.service.js will use it later.
 */
export async function getConversationContext(
  userId,
  conversationId,
  limit = 10
) {
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
    const error = new Error("Conversation not found.");
    error.statusCode = 404;
    throw error;
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      sender: true,
      text: true,
      createdAt: true,
    },
  });

  // Database query gets newest first for efficiency.
  // AI context should normally be oldest → newest.
  return messages.reverse();
}