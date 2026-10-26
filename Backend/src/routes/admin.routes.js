import express from "express";
import { adminUpdateAppointmentStatusController } from "../controllers/appointments.controller.js";
import { adminCreateAvailabilitySlotController, adminCreateCounsellorController } from "../controllers/counsellor.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();
router.use(authMiddleware, requireAdmin);
router.post("/counsellors", adminCreateCounsellorController);
router.post("/counsellors/:counsellorId/slots", adminCreateAvailabilitySlotController);
router.patch("/appointments/:appointmentId/status", adminUpdateAppointmentStatusController);

export default router;
