import prisma from "../db/prisma.js";

const MAX_LIST_RESULTS = 50;

function titleFromContent(content) {
  const firstLine = content.split(/\r?\n/, 1)[0]?.trim() ?? "";
  return firstLine.slice(0, 120) || "Untitled reflection";
}

function toSummary(entry) {
  return {
    id: entry.id,
    entryId: entry.id,
    title: entry.title,
    snippet: entry.content.slice(0, 160),
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function toDetail(entry) {
  return {
    ...toSummary(entry),
    content: entry.content,
  };
}

// Every database query includes the authenticated user ID.
export async function getJournalEntries(userId, search = "") {
  const where = {
    userId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const entries = await prisma.journalEntry.findMany({
    where,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    take: MAX_LIST_RESULTS,
  });

  return entries.map(toSummary);
}

export async function getJournalEntryById(userId, entryId) {
  const entry = await prisma.journalEntry.findFirst({
    where: { id: entryId, userId },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!entry) {
    const error = new Error("Journal entry not found.");
    error.statusCode = 404;
    throw error;
  }

  return toDetail(entry);
}

export async function createJournalEntry(userId, { content, title }) {
  const entry = await prisma.journalEntry.create({
    data: {
      userId,
      content,
      title: title || titleFromContent(content),
    },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return toDetail(entry);
}

export async function updateJournalEntry(userId, entryId, { content, title }) {
  // updateMany is user-scoped, preventing an ID from updating another user's entry.
  const result = await prisma.journalEntry.updateMany({
    where: { id: entryId, userId },
    data: {
      content,
      title: title || titleFromContent(content),
    },
  });

  if (result.count === 0) {
    const error = new Error("Journal entry not found.");
    error.statusCode = 404;
    throw error;
  }

  return getJournalEntryById(userId, entryId);
}

export async function deleteJournalEntry(userId, entryId) {
  // A single user-scoped delete avoids a check-then-delete authorization race.
  const result = await prisma.journalEntry.deleteMany({
    where: { id: entryId, userId },
  });

  if (result.count === 0) {
    const error = new Error("Journal entry not found.");
    error.statusCode = 404;
    throw error;
  }
}
