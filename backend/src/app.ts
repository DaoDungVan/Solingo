import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import lessonRoutes from "./routes/lesson.routes";
import profileRoutes from "./routes/profile.routes";
import vocabRoutes from "./routes/vocab.routes";
import progressRoutes from "./routes/progress.routes";
import chatRoutes from "./routes/chat.routes";
import ttsRoutes from "./routes/tts.routes";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "solingo-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api", lessonRoutes);
app.use("/api", profileRoutes);
app.use("/api", vocabRoutes);
app.use("/api", progressRoutes);
app.use("/api", chatRoutes);
app.use("/api", ttsRoutes);

export default app;
