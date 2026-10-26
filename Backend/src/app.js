import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorMiddleware } from "./middleware/error.middleware.js";
import chatRoutes from "./routes/chat.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import authRoutes from "./routes/auth.routes.js";
import resourceRoutes from "./routes/resources.routes.js";
import journalRoutes from "./routes/journal.routes.js";

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server and health-check requests without an Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error("Origin is not allowed by CORS.");
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
}));
// The Journal UI accepts up to 30,000 characters; allow JSON escaping/UTF-8 overhead.
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/journal", journalRoutes);

app.use((req, res) => res.status(404).json({
  success: false,
  message: `Route not found: ${req.method} ${req.originalUrl}`,
}));
app.use(errorMiddleware);

export default app;
