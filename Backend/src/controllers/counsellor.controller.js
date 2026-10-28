import {
  createAvailabilitySlot,
  createCounsellor,
  getActiveCounsellors,
  getAdminCounsellors,
  getAdminCounsellorUsers,
  getCounsellorSlots,
  linkCounsellorUser,
  updateCounsellor,
} from "../services/counsellor.service.js";

const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_WITH_ZONE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i;

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function handleError(res, error, fallback) {
  if ([400, 404, 409].includes(error.statusCode)) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }
  if (error?.code === "P2002") {
    return res.status(409).json({ success: false, message: "A conflicting record already exists." });
  }
  console.error(fallback, error);
  return res.status(500).json({ success: false, message: fallback });
}

function validDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function zonedDateTime(value) {
  if (typeof value !== "string" || !ISO_WITH_ZONE_PATTERN.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function boundedOptionalString(body, key, maxLength, res) {
  if (body[key] === undefined || body[key] === null || body[key] === "") return undefined;
  if (typeof body[key] !== "string") {
    badRequest(res, `${key} must be a string.`);
    return null;
  }
  const value = body[key].trim();
  if (value.length > maxLength) {
    badRequest(res, `${key} must be ${maxLength} characters or fewer.`);
    return null;
  }
  return value || undefined;
}

// GET /api/counsellors
export async function getCounsellorsController(req, res) {
  try {
    const counsellors = await getActiveCounsellors();
    return res.status(200).json({
      success: true,
      message: "Counsellors fetched successfully.",
      data: counsellors,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch counsellors.");
  }
}

// GET /api/counsellors/:counsellorId/slots?date=YYYY-MM-DD
export async function getCounsellorSlotsController(req, res) {
  const { counsellorId } = req.params;
  const date = req.query.date;
  if (!UUID_PATTERN.test(counsellorId)) return badRequest(res, "counsellorId must be a valid UUID.");
  if (!validDate(date)) return badRequest(res, "date must be a valid calendar date in YYYY-MM-DD format.");

  try {
    const slots = await getCounsellorSlots(counsellorId, date);
    return res.status(200).json({
      success: true,
      message: "Availability fetched successfully.",
      data: slots,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch availability.");
  }
}

// POST /api/admin/counsellors — publish only providers who have been vetted.
export async function adminCreateCounsellorController(req, res) {
  const body = req.body ?? {};
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest(res, "Request body must be a JSON object.");
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return badRequest(res, "name is required.");
  }
  const name = body.name.trim();
  if (name.length > 100) return badRequest(res, "name must be 100 characters or fewer.");

  const specialty = boundedOptionalString(body, "specialty", 120, res);
  if (specialty === null) return res;
  const bio = boundedOptionalString(body, "bio", 3000, res);
  if (bio === null) return res;
  const avatarUrl = boundedOptionalString(body, "avatarUrl", 500, res);
  if (avatarUrl === null) return res;

  if (avatarUrl) {
    try {
      const url = new URL(avatarUrl);
      if (url.protocol !== "https:") return badRequest(res, "avatarUrl must use HTTPS.");
    } catch {
      return badRequest(res, "avatarUrl must be a valid HTTPS URL.");
    }
  }

  const timeZone = body.timeZone === undefined ? "Asia/Kolkata" : body.timeZone;
  if (typeof timeZone !== "string" || !timeZone.trim()) {
    return badRequest(res, "timeZone must be an IANA timezone string.");
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timeZone.trim() });
  } catch {
    return badRequest(res, "timeZone must be a supported IANA timezone.");
  }
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return badRequest(res, "isActive must be a boolean.");
  }

  try {
    const counsellor = await createCounsellor({
      name,
      specialty,
      bio,
      avatarUrl,
      timeZone: timeZone.trim(),
      isActive: body.isActive ?? false,
    });
    return res.status(201).json({
      success: true,
      message: "Counsellor created successfully.",
      data: counsellor,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create counsellor.");
  }
}

// POST /api/admin/counsellors/:counsellorId/slots
export async function adminCreateAvailabilitySlotController(req, res) {
  const { counsellorId } = req.params;
  if (!UUID_PATTERN.test(counsellorId)) return badRequest(res, "counsellorId must be a valid UUID.");

  const body = req.body ?? {};
  const startsAt = zonedDateTime(body.startsAt);
  const endsAt = zonedDateTime(body.endsAt);
  if (!startsAt) return badRequest(res, "startsAt must be an ISO date-time with a timezone.");
  if (!endsAt) return badRequest(res, "endsAt must be an ISO date-time with a timezone.");
  if (startsAt <= new Date()) return badRequest(res, "Availability slots must be in the future.");
  if (endsAt <= startsAt) return badRequest(res, "endsAt must be later than startsAt.");

  const durationMinutes = (endsAt.getTime() - startsAt.getTime()) / 60_000;
  if (durationMinutes < 15 || durationMinutes > 180) {
    return badRequest(res, "Availability slots must be between 15 and 180 minutes long.");
  }

  try {
    const slot = await createAvailabilitySlot(counsellorId, startsAt, endsAt);
    return res.status(201).json({
      success: true,
      message: "Availability slot created successfully.",
      data: slot,
    });
  } catch (error) {
    return handleError(res, error, "Failed to create availability slot.");
  }
}


// GET /api/admin/counsellors — includes inactive listings for operations.
export async function adminGetCounsellorsController(req, res) {
  try {
    const counsellors = await getAdminCounsellors();
    return res.status(200).json({
      success: true,
      message: "Administrative counsellor list fetched successfully.",
      data: counsellors,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch administrative counsellors.");
  }
}


// GET /api/admin/counselor-users — authenticated counselor accounts available for linking.
export async function adminGetCounsellorUsersController(_req, res) {
  try {
    const users = await getAdminCounsellorUsers();
    return res.status(200).json({
      success: true,
      message: "Counsellor accounts fetched successfully.",
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        linkedCounsellorId: user.counsellorProfile?.id ?? null,
        linkedCounsellorName: user.counsellorProfile?.name ?? null,
      })),
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch counsellor accounts.");
  }
}

// PATCH /api/admin/counsellors/:counsellorId/account
export async function adminLinkCounsellorUserController(req, res) {
  const { counsellorId } = req.params;
  if (!UUID_PATTERN.test(counsellorId)) return badRequest(res, "counsellorId must be a valid UUID.");
  const body = req.body ?? {};
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest(res, "Request body must be a JSON object.");
  }
  if (body.userId !== null && (typeof body.userId !== "string" || !UUID_PATTERN.test(body.userId))) {
    return badRequest(res, "userId must be a valid application-user UUID or null.");
  }
  try {
    const profile = await linkCounsellorUser(counsellorId, body.userId);
    return res.status(200).json({
      success: true,
      message: body.userId ? "Counsellor account linked successfully." : "Counsellor account unlinked successfully.",
      data: {
        id: profile.id,
        userId: profile.userId,
        user: profile.user,
      },
    });
  } catch (error) {
    return handleError(res, error, "Failed to link counsellor account.");
  }
}

// PATCH /api/admin/counsellors/:counsellorId — publish or hide the directory profile.
export async function adminUpdateCounsellorController(req, res) {
  const { counsellorId } = req.params;
  if (!UUID_PATTERN.test(counsellorId)) return badRequest(res, "counsellorId must be a valid UUID.");
  const body = req.body ?? {};
  if (typeof body.isActive !== "boolean") return badRequest(res, "isActive must be a boolean.");
  try {
    const counsellor = await updateCounsellor(counsellorId, { isActive: body.isActive });
    return res.status(200).json({
      success: true,
      message: `Counsellor profile ${body.isActive ? "published" : "hidden"} successfully.`,
      data: counsellor,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update counsellor profile.");
  }
}
