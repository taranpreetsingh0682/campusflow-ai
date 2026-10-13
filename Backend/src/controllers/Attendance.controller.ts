
import { Request, Response } from "express";
import mongoose from "mongoose";

import Attendance from "../models/Attendance";
import Enrollment from "../models/Enrollment";

// Validate MongoDB ObjectId
const isValidId = (id: unknown): id is string =>
  typeof id === "string" && mongoose.isValidObjectId(id);

// Normalize attendance date to UTC midnight
const normalizeDate = (value: unknown): Date | null => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  // Require an ISO date or ISO datetime with an explicit timezone.
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

  if (!isDateOnly && !hasTimezone) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  // Avoid accepting normalized invalid calendar dates such as February 30.
  if (isDateOnly && parsed.toISOString().slice(0, 10) !== value) {
    return null;
  }

  parsed.setUTCHours(0, 0, 0, 0);
  return parsed;
};

// CREATE ATTENDANCE
export const createAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { student, subject, faculty, date, status } = req.body;

    if (!student || !subject || !faculty || !date || !status) {
      res.status(400).json({
        success: false,
        message:
          "Student, subject, faculty, date and status are required",
      });
      return;
    }

    if (
      !isValidId(student) ||
      !isValidId(subject) ||
      !isValidId(faculty)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid student, subject or faculty ID",
      });
      return;
    }

    if (!["present", "absent"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be present or absent",
      });
      return;
    }

    const attendanceDate = normalizeDate(date);

    if (!attendanceDate) {
      res.status(400).json({
        success: false,
        message:
          "Provide a valid date in YYYY-MM-DD or ISO datetime format",
      });
      return;
    }

    // Verify student-subject-faculty enrollment
    const enrollment = await Enrollment.findOne({
      student,
      subject,
      faculty,
    });

    if (!enrollment) {
      res.status(400).json({
        success: false,
        message:
          "Student is not enrolled in this subject with this faculty",
      });
      return;
    }

    // Prevent duplicate attendance for the same student, subject and day
    const existingAttendance = await Attendance.findOne({
      student,
      subject,
      date: attendanceDate,
    });

    if (existingAttendance) {
      res.status(409).json({
        success: false,
        message:
          "Attendance already marked for this student, subject and date",
      });
      return;
    }

    const attendance = await Attendance.create({
      student,
      subject,
      faculty,
      date: attendanceDate,
      status,
    });

    const populatedAttendance = await Attendance.findById(
      attendance._id
    )
      .populate("student")
      .populate("subject")
      .populate("faculty");

    res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      data: populatedAttendance,
    });
  } catch (error: any) {
    // MongoDB unique-index duplicate-key error
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message:
          "Attendance already exists for this student, subject and date",
      });
      return;
    }

    console.error("Create attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create attendance",
    });
  }
};

// GET ALL ATTENDANCE
export const getAllAttendance = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const attendance = await Attendance.find()
      .populate("student")
      .populate("subject")
      .populate("faculty")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error: any) {
    console.error("Get all attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};

// GET ATTENDANCE BY ID
export const getAttendanceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid attendance ID",
      });
      return;
    }

    const attendance = await Attendance.findById(id)
      .populate("student")
      .populate("subject")
      .populate("faculty");

    if (!attendance) {
      res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    console.error("Get attendance by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};

// GET STUDENT ATTENDANCE REPORT
export const getStudentAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;

    if (!isValidId(studentId)) {
      res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
      return;
    }

    const attendance = await Attendance.find({
      student: studentId,
    })
      .populate("subject")
      .populate("faculty")
      .sort({ date: -1 });

    const totalClasses = attendance.length;

    const presentClasses = attendance.filter(
      (record) => record.status === "present"
    ).length;

    const absentClasses = attendance.filter(
      (record) => record.status === "absent"
    ).length;

    const attendancePercentage =
      totalClasses === 0
        ? 0
        : Number(
            ((presentClasses / totalClasses) * 100).toFixed(2)
          );

    res.status(200).json({
      success: true,
      studentId,
      summary: {
        totalClasses,
        presentClasses,
        absentClasses,
        attendancePercentage,
      },
      data: attendance,
    });
  } catch (error: any) {
    console.error("Get student attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
    });
  }
};

// UPDATE ATTENDANCE — only status can be changed
export const updateAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid attendance ID",
      });
      return;
    }

    // Do not allow clients to change student, subject, faculty or date.
    const allowedKeys = ["status"];
    const unexpectedKeys = Object.keys(req.body).filter(
      (key) => !allowedKeys.includes(key)
    );

    if (unexpectedKeys.length > 0) {
      res.status(400).json({
        success: false,
        message: "Only the attendance status can be updated",
      });
      return;
    }

    if (
      typeof status !== "string" ||
      !["present", "absent"].includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: "Status must be present or absent",
      });
      return;
    }

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("student")
      .populate("subject")
      .populate("faculty");

    if (!attendance) {
      res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error: any) {
    console.error("Update attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
    });
  }
};

// DELETE ATTENDANCE
export const deleteAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid attendance ID",
      });
      return;
    }

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete attendance",
    });
  }
};
