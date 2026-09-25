import { Router } from "express";

import {
    healthCheck,
    testUsers
} from "../controllers/health.controller.js";
import { createTestUser } from "../controllers/dbTest.controller.js";

const router = Router();

router.get("/", healthCheck);

router.get("/users", testUsers);

// Route to create a test user in the database
router.post("/db-test", createTestUser);

export default router;