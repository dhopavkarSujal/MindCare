import express from "express";
import {
  bookAppointmentController,
  cancelAppointmentController,
  getAppointmentsController,
} from "../controllers/appointments.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", getAppointmentsController);
router.post("/", bookAppointmentController);
router.delete("/:appointmentId", cancelAppointmentController);

export default router;
