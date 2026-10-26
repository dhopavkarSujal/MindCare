import express from "express";
import {
  getCounsellorsController,
  getCounsellorSlotsController,
} from "../controllers/counsellor.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/", getCounsellorsController);
router.get("/:counsellorId/slots", getCounsellorSlotsController);

export default router;
