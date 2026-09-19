import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusFlow AI Backend is running 🚀",
  });
});

export default app;