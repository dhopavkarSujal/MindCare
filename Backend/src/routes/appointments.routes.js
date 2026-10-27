import express from "express";
import {
  bookAppointmentController,
  cancelAppointmentController,
  getAppointmentsController,
} from "../controllers/appointments.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireStudent } from "../middleware/role.middleware.js";

const router = express.Router();
router.use(authMiddleware, requireStudent);
router.get("/", getAppointmentsController);
router.post("/", bookAppointmentController);
router.delete("/:appointmentId", cancelAppointmentController);

export default router;
