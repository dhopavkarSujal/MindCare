import express from "express";
import {
  createJournalEntryController,
  deleteJournalEntryController,
  getJournalEntriesController,
  getJournalEntryController,
  updateJournalEntryController,
} from "../controllers/journal.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All journal endpoints are private and use the verified user from auth middleware.
router.use(authMiddleware);
router.get("/", getJournalEntriesController);
router.post("/", createJournalEntryController);
router.get("/:entryId", getJournalEntryController);
router.put("/:entryId", updateJournalEntryController);
router.delete("/:entryId", deleteJournalEntryController);

export default router;
