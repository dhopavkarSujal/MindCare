import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorMiddleware } from "./middleware/error.middleware.js";
import chatRoutes from "./routes/chat.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/conversations",
  conversationRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

app.use(
  "/api/moods",
  moodRoutes
);

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});
app.use(errorMiddleware);
export default app;