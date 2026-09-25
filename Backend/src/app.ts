import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import adminRoutes from "./routes/admin.routes";
import studentRoutes from "./routes/student.routes";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/",profileRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/students",studentRoutes);

// Health check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusFlow AI Backend is running 🚀",
  });
});

export default app;