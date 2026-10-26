import {
  getResourceById,
  getResources,
} from "../services/resources.service.js";

const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const MAX_SEARCH_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 80;

// Validate query parameters before building a database query.
function readQueryString(value, fieldName, maxLength) {
  if (value === undefined) return "";

  if (typeof value !== "string") {
    const error = new Error(`${fieldName} must be a single string.`);
    error.statusCode = 400;
    throw error;
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    const error = new Error(`${fieldName} must be ${maxLength} characters or fewer.`);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

// GET /api/resources?search=...&category=...
export async function getResourcesController(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    const search = readQueryString(req.query.search, "search", MAX_SEARCH_LENGTH);
    const category = readQueryString(req.query.category, "category", MAX_CATEGORY_LENGTH);
    const resources = await getResources({ search, category });

    return res.status(200).json({
      success: true,
      message: "Resources fetched successfully.",
      data: resources,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error("Get resources error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resources.",
    });
  }
}

// GET /api/resources/:resourceId
export async function getResourceController(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    const { resourceId } = req.params;
    if (!UUID_PATTERN.test(resourceId)) {
      return res.status(400).json({
        success: false,
        message: "resourceId must be a valid UUID.",
      });
    }

    const resource = await getResourceById(resourceId);
    return res.status(200).json({
      success: true,
      message: "Resource fetched successfully.",
      data: resource,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }

    console.error("Get resource error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resource.",
    });
  }
}
