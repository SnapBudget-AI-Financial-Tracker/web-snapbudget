import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatbotRoutes from './routes/chatbotRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "snapbudget-backend" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
