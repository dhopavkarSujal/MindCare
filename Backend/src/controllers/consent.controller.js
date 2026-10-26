import { getUserConsents, setUserConsent } from "../services/consent.service.js";

const SUPPORTED_PERMISSIONS = new Set(["share_mood_data", "notifications"]);

function getUserId(req) {
  return req.user?.id;
}

// GET /api/consents
export async function getConsentsController(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authenticated user is required." });
  }

  try {
    const consents = await getUserConsents(userId);
    return res.status(200).json({
      success: true,
      message: "Consent preferences fetched successfully.",
      data: consents,
    });
  } catch (error) {
    console.error("Get consent preferences error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch consent preferences." });
  }
}

// POST /api/consents
export async function updateConsentController(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Authenticated user is required." });
  }

  const body = req.body ?? {};
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ success: false, message: "Request body must be a JSON object." });
  }

  const { permission, enabled } = body;
  if (typeof permission !== "string" || !SUPPORTED_PERMISSIONS.has(permission)) {
    return res.status(400).json({ success: false, message: "Unsupported consent permission." });
  }
  if (typeof enabled !== "boolean") {
    return res.status(400).json({ success: false, message: "enabled must be a boolean." });
  }

  try {
    const consent = await setUserConsent(userId, permission, enabled);
    return res.status(200).json({
      success: true,
      message: "Consent preference updated successfully.",
      data: consent,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Update consent preference error:", error);
    return res.status(500).json({ success: false, message: "Failed to update consent preference." });
  }
}
