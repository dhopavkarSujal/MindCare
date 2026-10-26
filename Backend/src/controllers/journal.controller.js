import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntryById,
  getJournalEntries,
  updateJournalEntry,
} from "../services/journal.service.js";

const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const MAX_CONTENT_LENGTH = 30_000;
const MAX_TITLE_LENGTH = 120;
const MAX_SEARCH_LENGTH = 100;

function getUserId(req) {
  // Only use the user set by verified Supabase authentication middleware.
  return req.user?.id;
}

function readText(value, field, maxLength, { optional = false } = {}) {
  if (value === undefined && optional) return undefined;
  if (typeof value !== "string") {
    const error = new Error(`${field} must be a string.`);
    error.statusCode = 400;
    throw error;
  }

  const normalized = value.trim();
  if (!normalized && !optional) {
    const error = new Error(`${field} cannot be empty.`);
    error.statusCode = 400;
    throw error;
  }
  if (normalized.length > maxLength) {
    const error = new Error(`${field} must be ${maxLength} characters or fewer.`);
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

function handleError(res, error, fallbackMessage) {
  if (error.statusCode === 400) {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.statusCode === 404) {
    return res.status(404).json({ success: false, message: error.message });
  }
  console.error(fallbackMessage, error);
  return res.status(500).json({ success: false, message: fallbackMessage });
}

// GET /api/journal?search=...
export async function getJournalEntriesController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authenticated user is required." });
    }

    const search = readText(req.query.search, "search", MAX_SEARCH_LENGTH, { optional: true }) ?? "";
    const entries = await getJournalEntries(userId, search);
    return res.status(200).json({
      success: true,
      message: "Journal entries fetched successfully.",
      data: entries,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch journal entries.");
  }
}

// GET /api/journal/:entryId
export async function getJournalEntryController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authenticated user is required." });
    }

    const { entryId } = req.params;
    if (!UUID_PATTERN.test(entryId)) {
      return res.status(400).json({ success: false, message: "entryId must be a valid UUID." });
    }

    const entry = await getJournalEntryById(userId, entryId);
    return res.status(200).json({
      success: true,
      message: "Journal entry fetched successfully.",
      data: entry,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch journal entry.");
  }
}

// POST /api/journal
export async function createJournalEntryController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authenticated user is required." });
    }

    const body = req.body ?? {};
    const content = readText(body.content, "content", MAX_CONTENT_LENGTH);
    const title = readText(body.title, "title", MAX_TITLE_LENGTH, { optional: true });
    const entry = await createJournalEntry(userId, { content, title });
    return res.status(201).json({
      success: true,
      message: "Journal entry created successfully.",
      data: entry,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create journal entry.");
  }
}

// PUT /api/journal/:entryId
export async function updateJournalEntryController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authenticated user is required." });
    }

    const { entryId } = req.params;
    if (!UUID_PATTERN.test(entryId)) {
      return res.status(400).json({ success: false, message: "entryId must be a valid UUID." });
    }

    const body = req.body ?? {};
    const content = readText(body.content, "content", MAX_CONTENT_LENGTH);
    const title = readText(body.title, "title", MAX_TITLE_LENGTH, { optional: true });
    const entry = await updateJournalEntry(userId, entryId, { content, title });
    return res.status(200).json({
      success: true,
      message: "Journal entry updated successfully.",
      data: entry,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update journal entry.");
  }
}

// DELETE /api/journal/:entryId
export async function deleteJournalEntryController(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authenticated user is required." });
    }

    const { entryId } = req.params;
    if (!UUID_PATTERN.test(entryId)) {
      return res.status(400).json({ success: false, message: "entryId must be a valid UUID." });
    }

    await deleteJournalEntry(userId, entryId);
    return res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete journal entry.");
  }
}
