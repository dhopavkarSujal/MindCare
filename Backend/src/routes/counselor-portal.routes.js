import express from "express";
import {
  completeCounsellorAppointmentController,
  createCounsellorSlotController,
  deactivateCounsellorSlotController,
  getCounsellorAppointmentsController,
  getCounsellorMeController,
  getCounsellorPortalSlotsController,
} from "../controllers/counsellor-portal.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireCounselor } from "../middleware/role.middleware.js";

const router = express.Router();
router.use(authMiddleware, requireCounselor);
router.get("/me", getCounsellorMeController);
router.get("/appointments", getCounsellorAppointmentsController);
router.patch("/appointments/:appointmentId/complete", completeCounsellorAppointmentController);
router.get("/slots", getCounsellorPortalSlotsController);
router.post("/slots", createCounsellorSlotController);
router.patch("/slots/:slotId", deactivateCounsellorSlotController);

export default router;
