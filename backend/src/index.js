import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import savingGoalRoutes from "./routes/savingGoalRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import prisma from "./config/prisma.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Verify Prisma is initialized
if (!prisma) {
  console.error("Server cannot start: Prisma client failed to initialize");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
