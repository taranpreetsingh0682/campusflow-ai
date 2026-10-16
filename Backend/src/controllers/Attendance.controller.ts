
import { Request, Response } from "express";
import mongoose from "mongoose";

import Attendance from "../models/Attendance";
import Enrollment from "../models/Enrollment";
import Faculty from "../models/Faculty";
import Subject from "../models/Subject";

// Validate MongoDB ObjectId
const isValidId = (id: unknown): id is string =>
  typeof id === "string" && mongoose.isValidObjectId(id);

// Normalize attendance date to UTC midnight
const normalizeDate = (value: unknown): Date | null => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

  if (!isDateOnly && !hasTimezone) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

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
    const { student, subject, date, status } = req.body;
    const loggedInUser = (req as any).user;

    if (!loggedInUser?.id || !loggedInUser?.role) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!student || !subject || !date || !status) {
      res.status(400).json({
        success: false,
        message: "Student, subject, date and status are required",
      });
      return;
    }

    if (!isValidId(student) || !isValidId(subject)) {
      res.status(400).json({
        success: false,
        message: "Invalid student or subject ID",
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

    const subjectRecord = await Subject.findById(subject);

    if (!subjectRecord) {
      res.status(404).json({
        success: false,
        message: "Subject not found",
      });
      return;
    }

    let authorizedFacultyId: string;

    if (loggedInUser.role === "faculty") {
      // Resolve faculty identity from the authenticated account.
      const facultyRecord = await Faculty.findOne({
        user: loggedInUser.id,
      });

      if (!facultyRecord) {
        res.status(403).json({
          success: false,
          message: "No faculty profile is linked to your account",
        });
        return;
      }

      const facultyId = facultyRecord._id.toString();

      const assignedInSubject = subjectRecord.faculty.some(
        (id) => id.toString() === facultyId
      );

      const assignedInFaculty = facultyRecord.subjects.some(
        (id) => id.toString() === subject
      );

      if (!assignedInSubject && !assignedInFaculty) {
        res.status(403).json({
          success: false,
          message: "You are not assigned to this subject",
        });
        return;
      }

      authorizedFacultyId = facultyId;
    } else if (["admin", "hod"].includes(loggedInUser.role)) {
      const { faculty } = req.body;

      if (!isValidId(faculty)) {
        res.status(400).json({
          success: false,
          message: "A valid faculty ID is required",
        });
        return;
      }

      const facultyRecord = await Faculty.findById(faculty);

      if (!facultyRecord) {
        res.status(404).json({
          success: false,
          message: "Faculty not found",
        });
        return;
      }

      authorizedFacultyId = facultyRecord._id.toString();
    } else {
      res.status(403).json({
        success: false,
        message: "You do not have permission to mark attendance",
      });
      return;
    }

    // Verify the student is enrolled in this subject with this faculty.
    const enrollment = await Enrollment.findOne({
      student,
      subject,
      faculty: authorizedFacultyId,
    });

    if (!enrollment) {
      res.status(403).json({
        success: false,
        message:
          "Student is not enrolled in this subject with this faculty",
      });
      return;
    }

    // Prevent duplicate attendance for the same student, subject and day.
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
      faculty: authorizedFacultyId,
      date: attendanceDate,
      status,
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("student")
      .populate("subject")
      .populate("faculty");

    res.status(201).json({
      success: true,
      message: "Attendance created successfully",
      data: populatedAttendance,
    });
  } catch (error: any) {
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

// GET ALL ATTENDANCE — admin/HOD routes
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
  } catch (error) {
    console.error("Get all attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};

// GET ATTENDANCE BY ID — admin/HOD routes
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
  } catch (error) {
    console.error("Get attendance by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};

// GET STUDENT ATTENDANCE REPORT — currently protected by admin/HOD route
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
        : Number(((presentClasses / totalClasses) * 100).toFixed(2));

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
  } catch (error) {
    console.error("Get student attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
    });
  }
};

// UPDATE ATTENDANCE — admin/HOD only
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

    const unexpectedKeys = Object.keys(req.body).filter(
      (key) => key !== "status"
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
      { new: true, runValidators: true }
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
  } catch (error) {
    console.error("Update attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
    });
  }
};

// DELETE ATTENDANCE — admin/HOD only
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
  } catch (error) {
    console.error("Delete attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete attendance",
    });
  }
};
