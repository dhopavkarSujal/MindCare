import { Router } from "express";

import {
    healthCheck,
    testUsers
} from "../controllers/health.controller.js";

const router = Router();

router.get("/", healthCheck);

router.get("/users", testUsers);

export default router;