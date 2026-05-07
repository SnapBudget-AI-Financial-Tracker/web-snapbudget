import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import savingGoalRoutes from "./routes/savingGoalRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import prisma from "./config/prisma.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use("/api/", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/saving-goals", savingGoalRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/gamification", gamificationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "snapbudget-backend" });
});

export default app;
