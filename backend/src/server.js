import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";

import authRouter from "./routes/auth.js";
import aiRouter from "./routes/ai.js";
import storyRouter from "./routes/story.js";
import userRouter from "./routes/user.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Connect to MongoDB
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/auth", authRouter);
app.use("/ai", aiRouter);
app.use("/stories", storyRouter);
app.use("/users", userRouter);

// Public health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Comic Book API Server" });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    auth: "custom-jwt"
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
