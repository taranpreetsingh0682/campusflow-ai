import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import adminRoutes from "./routes/admin.routes";
import studentRoutes from "./routes/student.routes";
import FeeStructureRoutes from "./routes/FeeStructure.routes";
import "./models/Department";
import scholarshipRoutes from "./routes/Scholarship.routes";
import StudentFeeRoutes from "./routes/StudentFee.routes";
import PaymentRoutes from "./routes/Payment.routes";
import EnrollmentRoutes from "./routes/Enrollment.routes";
import FacultyRoutes from "./routes/Faculty.routes";
import SubjectRoutes from "./routes/Subject.routes";
import AttendanceRoutes from "./routes/Attendance.routes";
import MarksRoutes from "./routes/Marks.routes";
import NotificationRoutes from "./routes/Notification.routes";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/",profileRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/students",studentRoutes);
app.use("/api/fees",FeeStructureRoutes);
app.use("/api/scholarship",scholarshipRoutes);
console.log("🔥 STUDENT FEE ROUTE LOADED");
app.use("/api/student-fees",StudentFeeRoutes);
app.use("/api/payments",PaymentRoutes);
app.use("/api/enrollments",EnrollmentRoutes);
app.use("/api/faculty",FacultyRoutes);
app.use("/api/subjects",SubjectRoutes);
app.use("/api/attendance",AttendanceRoutes);
app.use("/api/marks",MarksRoutes);
app.use("/api/notifications",NotificationRoutes);



// Health check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusFlow AI Backend is running 🚀",
  });
});

export default app;