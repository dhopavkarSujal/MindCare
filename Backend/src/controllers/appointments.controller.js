import {
  bookAppointment,
  cancelUserAppointment,
  getUserAppointments,
  updateAppointmentStatus,
} from "../services/appointments.service.js";

const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const ISO_WITH_ZONE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i;

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function handleError(res, error, fallback) {
  if ([400, 404, 409].includes(error.statusCode)) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }
  console.error(fallback, error);
  return res.status(500).json({ success: false, message: fallback });
}

// GET /api/appointments — return only appointments owned by the signed-in user.
export async function getAppointmentsController(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: "Authenticated user is required." });

  try {
    const appointments = await getUserAppointments(userId);
    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully.",
      data: appointments,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch appointments.");
  }
}

// POST /api/appointments
export async function bookAppointmentController(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: "Authenticated user is required." });

  const body = req.body ?? {};
  if (!body || typeof body !== "object" || Array.isArray(body)) return badRequest(res, "Request body must be a JSON object.");
  if (typeof body.counsellorId !== "string" || !UUID_PATTERN.test(body.counsellorId)) {
    return badRequest(res, "counsellorId must be a valid UUID.");
  }
  if (typeof body.startTime !== "string" || !ISO_WITH_ZONE_PATTERN.test(body.startTime) || Number.isNaN(new Date(body.startTime).getTime())) {
    return badRequest(res, "startTime must be an ISO date-time with a timezone.");
  }
  if (body.reason !== undefined && body.reason !== null && typeof body.reason !== "string") {
    return badRequest(res, "reason must be a string.");
  }
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length > 1000) return badRequest(res, "reason must be 1000 characters or fewer.");

  try {
    const appointment = await bookAppointment(userId, {
      counsellorId: body.counsellorId,
      startTime: body.startTime,
      reason,
    });
    return res.status(201).json({
      success: true,
      message: "Appointment request created successfully.",
      data: appointment,
    });
  } catch (error) {
    return handleError(res, error, "Failed to request appointment.");
  }
}

// DELETE /api/appointments/:appointmentId
export async function cancelAppointmentController(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: "Authenticated user is required." });
  if (!UUID_PATTERN.test(req.params.appointmentId)) return badRequest(res, "appointmentId must be a valid UUID.");

  try {
    await cancelUserAppointment(userId, req.params.appointmentId);
    return res.status(200).json({ success: true, message: "Appointment cancelled successfully." });
  } catch (error) {
    return handleError(res, error, "Failed to cancel appointment.");
  }
}

// PATCH /api/admin/appointments/:appointmentId/status
export async function adminUpdateAppointmentStatusController(req, res) {
  const { appointmentId } = req.params;
  if (!UUID_PATTERN.test(appointmentId)) return badRequest(res, "appointmentId must be a valid UUID.");

  const { status } = req.body ?? {};
  if (!["confirmed", "cancelled"].includes(status)) {
    return badRequest(res, "status must be either confirmed or cancelled.");
  }

  try {
    const result = await updateAppointmentStatus(appointmentId, status.toUpperCase());
    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${result.status}.`,
      data: result,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update appointment status.");
  }
}
