import {
  completeCounsellorAppointment,
  createCounsellorAvailability,
  deactivateCounsellorAvailability,
  getCounsellorAppointments,
  getCounsellorAvailability,
  getCounsellorWorkspace,
} from "../services/counsellor-portal.service.js";

const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const ISO_WITH_ZONE_PATTERN = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(?::\\d{2}(?:\\.\\d{1,3})?)?(?:Z|[+-]\\d{2}:\\d{2})$/i;
const VALID_STATUSES = ["pending", "confirmed", "cancelled", "rejected", "completed"];

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

function zonedDateTime(value) {
  if (typeof value !== "string" || !ISO_WITH_ZONE_PATTERN.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getCounsellorMeController(req, res) {
  try {
    const profile = await getCounsellorWorkspace(req.user.id);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return handleError(res, error, "Failed to load counselor profile.");
  }
}

export async function getCounsellorAppointmentsController(req, res) {
  const status = req.query.status ?? "";
  if (typeof status !== "string" || (status && !VALID_STATUSES.includes(status))) {
    return badRequest(res, "status must be pending, confirmed, cancelled, rejected, or completed.");
  }
  try {
    const appointments = await getCounsellorAppointments(req.user.id, status);
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return handleError(res, error, "Failed to fetch your appointments.");
  }
}

export async function getCounsellorPortalSlotsController(req, res) {
  try {
    const slots = await getCounsellorAvailability(req.user.id);
    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    return handleError(res, error, "Failed to fetch your availability.");
  }
}

export async function createCounsellorSlotController(req, res) {
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
    const slot = await createCounsellorAvailability(req.user.id, startsAt, endsAt);
    return res.status(201).json({ success: true, message: "Availability slot created.", data: slot });
  } catch (error) {
    return handleError(res, error, "Failed to create availability.");
  }
}

export async function deactivateCounsellorSlotController(req, res) {
  if (!UUID_PATTERN.test(req.params.slotId)) return badRequest(res, "slotId must be a valid UUID.");
  try {
    await deactivateCounsellorAvailability(req.user.id, req.params.slotId);
    return res.status(200).json({ success: true, message: "Availability slot removed." });
  } catch (error) {
    return handleError(res, error, "Failed to remove availability.");
  }
}

export async function completeCounsellorAppointmentController(req, res) {
  if (!UUID_PATTERN.test(req.params.appointmentId)) return badRequest(res, "appointmentId must be a valid UUID.");
  try {
    const result = await completeCounsellorAppointment(req.user.id, req.params.appointmentId);
    return res.status(200).json({ success: true, message: "Appointment marked completed.", data: result });
  } catch (error) {
    return handleError(res, error, "Failed to complete appointment.");
  }
}
