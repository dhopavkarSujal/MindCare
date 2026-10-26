import { getUserProfile, updateUserProfile } from "../services/profile.service.js";

const MAX_NAME_LENGTH = 100;
const MAX_PREFERENCES_BYTES = 10_000;

function getUserId(req) {
  return req.user?.id;
}

function invalid(res, message) {
  return res.status(400).json({ success: false, message });
}

// GET /api/profile
export async function getProfileController(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authenticated user is required." });
  }

  try {
    const profile = await getUserProfile(userId);
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: profile,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("Get profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch profile." });
  }
}

// PUT /api/profile
export async function updateProfileController(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authenticated user is required." });
  }

  const body = req.body ?? {};
  const allowedFields = ["name", "preferences"];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return invalid(res, "Request body must be a JSON object.");
  }
  if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
    return invalid(res, "Only name and preferences can be updated.");
  }
  if (!allowedFields.some((key) => Object.hasOwn(body, key))) {
    return invalid(res, "Provide at least one profile field to update.");
  }

  let name;
  if (Object.hasOwn(body, "name")) {
    if (typeof body.name !== "string") {
      return invalid(res, "name must be a string.");
    }
    name = body.name.trim();
    if (!name) return invalid(res, "name cannot be empty.");
    if (name.length > MAX_NAME_LENGTH) {
      return invalid(res, `name must be ${MAX_NAME_LENGTH} characters or fewer.`);
    }
  }

  let preferences;
  if (Object.hasOwn(body, "preferences")) {
    if (!body.preferences || typeof body.preferences !== "object" || Array.isArray(body.preferences)) {
      return invalid(res, "preferences must be a JSON object.");
    }
    let serialized;
    try {
      serialized = JSON.stringify(body.preferences);
    } catch {
      return invalid(res, "preferences must contain valid JSON values.");
    }
    if (!serialized || Buffer.byteLength(serialized, "utf8") > MAX_PREFERENCES_BYTES) {
      return invalid(res, "preferences must be 10 KB or smaller.");
    }
    preferences = body.preferences;
  }

  try {
    const profile = await updateUserProfile(userId, { name, preferences });
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile." });
  }
}
