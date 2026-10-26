import express from "express";
import {
  getResourceController,
  getResourcesController,
} from "../controllers/resources.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Resource content is available to signed-in MindCare users only.
router.use(authMiddleware);
router.get("/", getResourcesController);
router.get("/:resourceId", getResourceController);

export default router;
