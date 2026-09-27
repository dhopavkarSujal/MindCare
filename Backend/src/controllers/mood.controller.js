import {
  createMoodEntry,
  getUserMoodEntries,
  getMoodEntryById,
  updateMoodEntry,
  deleteMoodEntry,
} from "../services/mood.service.js";

/**
 * Temporary user ID resolver.
 *
 * Before authentication:
 * req.body.userId
 * req.query.userId
 *
 * After authentication:
 * req.user.id
 */
function getUserId(req) {
  return req.user?.id;
}

/**
 * POST /api/moods
 */
export async function createMoodController(
  req,
  res
) {
  try {
    const userId = getUserId(req);

    const { score, note } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    if (
      score === undefined ||
      score === null ||
      !Number.isInteger(score)
    ) {
      return res.status(400).json({
        success: false,
        message: "score must be an integer.",
      });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: "score must be between 1 and 5.",
      });
    }

    if (
      note !== undefined &&
      note !== null &&
      typeof note !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "note must be a string.",
      });
    }

    const moodEntry = await createMoodEntry({
      userId,
      score,
      note,
    });

    return res.status(201).json({
      success: true,
      message: "Mood entry created successfully.",
      data: moodEntry,
    });
  } catch (error) {
    console.error(
      "Create mood error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to create mood entry.",
    });
  }
}

/**
 * GET /api/moods
 */
export async function getUserMoodsController(
  req,
  res
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    const moodEntries =
      await getUserMoodEntries(userId);

    return res.status(200).json({
      success: true,
      message: "Mood entries fetched successfully.",
      data: moodEntries,
    });
  } catch (error) {
    console.error(
      "Get moods error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch mood entries.",
    });
  }
}

/**
 * GET /api/moods/:moodId
 */
export async function getMoodController(
  req,
  res
) {
  try {
    const userId = getUserId(req);

    const { moodId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    if (!moodId) {
      return res.status(400).json({
        success: false,
        message: "moodId is required.",
      });
    }

    const moodEntry =
      await getMoodEntryById(
        userId,
        moodId
      );

    return res.status(200).json({
      success: true,
      message: "Mood entry fetched successfully.",
      data: moodEntry,
    });
  } catch (error) {
    console.error(
      "Get mood error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch mood entry.",
    });
  }
}

/**
 * PATCH /api/moods/:moodId
 */
export async function updateMoodController(
  req,
  res
) {
  try {
    const userId = getUserId(req);

    const { moodId } = req.params;

    const {
      score,
      note,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    if (!moodId) {
      return res.status(400).json({
        success: false,
        message: "moodId is required.",
      });
    }

    if (
      score === undefined &&
      note === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field must be provided.",
      });
    }

    if (
      score !== undefined &&
      (
        !Number.isInteger(score) ||
        score < 1 ||
        score > 5
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "score must be an integer between 1 and 5.",
      });
    }

    if (
      note !== undefined &&
      note !== null &&
      typeof note !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "note must be a string.",
      });
    }

    const moodEntry =
      await updateMoodEntry({
        userId,
        moodId,
        score,
        note,
      });

    return res.status(200).json({
      success: true,
      message: "Mood entry updated successfully.",
      data: moodEntry,
    });
  } catch (error) {
    console.error(
      "Update mood error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update mood entry.",
    });
  }
}

/**
 * DELETE /api/moods/:moodId
 */
export async function deleteMoodController(
  req,
  res
) {
  try {
    const userId = getUserId(req);

    const { moodId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    if (!moodId) {
      return res.status(400).json({
        success: false,
        message: "moodId is required.",
      });
    }

    await deleteMoodEntry(
      userId,
      moodId
    );

    return res.status(200).json({
      success: true,
      message: "Mood entry deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete mood error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to delete mood entry.",
    });
  }
}