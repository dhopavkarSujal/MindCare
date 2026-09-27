import prisma from "../db/prisma.js";

/**
 * Create a new mood entry.
 */
export async function createMoodEntry({
  userId,
  score,
  note,
}) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const moodEntry = await prisma.moodLog.create({
    data: {
      userId,
      score,
      note: note?.trim() || null,
    },
  });

  return moodEntry;
}

/**
 * Get all mood entries for a user.
 */
export async function getUserMoodEntries(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const moodEntries = await prisma.moodLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return moodEntries;
}

/**
 * Get one mood entry belonging to the user.
 */
export async function getMoodEntryById(
  userId,
  moodId
) {
  const moodEntry =
    await prisma.moodLog.findFirst({
      where: {
        id: moodId,
        userId,
      },
    });

  if (!moodEntry) {
    const error = new Error(
      "Mood entry not found."
    );

    error.statusCode = 404;

    throw error;
  }

  return moodEntry;
}

/**
 * Update an existing mood entry.
 */
export async function updateMoodEntry({
  userId,
  moodId,
  score,
  note,
}) {
  const existingMood =
    await prisma.moodLog.findFirst({
      where: {
        id: moodId,
        userId,
      },
      select: {
        id: true,
      },
    });

  if (!existingMood) {
    const error = new Error(
      "Mood entry not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const data = {};

  if (score !== undefined) {
    data.score = score;
  }

  if (note !== undefined) {
    data.note =
      note?.trim() || null;
  }

  const moodEntry =
    await prisma.moodLog.update({
      where: {
        id: moodId,
      },
      data,
    });

  return moodEntry;
}

/**
 * Delete an existing mood entry.
 */
export async function deleteMoodEntry(
  userId,
  moodId
) {
  const existingMood =
    await prisma.moodLog.findFirst({
      where: {
        id: moodId,
        userId,
      },
      select: {
        id: true,
      },
    });

  if (!existingMood) {
    const error = new Error(
      "Mood entry not found."
    );

    error.statusCode = 404;

    throw error;
  }

  await prisma.moodLog.delete({
    where: {
      id: moodId,
    },
  });

  return true;
}