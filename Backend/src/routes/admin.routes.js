import express from "express";
import { adminGetAppointmentsController, adminUpdateAppointmentStatusController } from "../controllers/appointments.controller.js";
import { adminCreateAvailabilitySlotController, adminCreateCounsellorController, adminGetCounsellorsController } from "../controllers/counsellor.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();
router.use(authMiddleware, requireAdmin);
router.get("/counsellors", adminGetCounsellorsController);
router.get("/appointments", adminGetAppointmentsController);
router.post("/counsellors", adminCreateCounsellorController);
router.post("/counsellors/:counsellorId/slots", adminCreateAvailabilitySlotController);
router.patch("/appointments/:appointmentId/status", adminUpdateAppointmentStatusController);

export default router;
