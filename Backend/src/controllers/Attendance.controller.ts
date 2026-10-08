import { Request, Response } from "express";

import Attendance from "../models/Attendance";
import Enrollment from "../models/Enrollment";

// CREATE ATTENDANCE
export const createAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      student,
      subject,
      faculty,
      date,
      status,
    } = req.body;

    // Required fields
    if (
      !student ||
      !subject ||
      !faculty ||
      !date ||
      !status
    ) {
      res.status(400).json({
        success: false,
        message:
          "Student, subject, faculty, date and status are required",
      });
      return;
    }

    // Check valid status
    if (!["present", "absent"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be present or absent",
      });
      return;
    }

    // Check enrollment
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

    // Check duplicate attendance
    const existingAttendance = await Attendance.findOne({
      student,
      subject,
      date: new Date(date),
    });

    if (existingAttendance) {
      res.status(400).json({
        success: false,
        message:
          "Attendance already marked for this student on this date",
      });
      return;
    }

    const attendance = await Attendance.create({
      student,
      subject,
      faculty,
      date: new Date(date),
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
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message:
          "Attendance already exists for this student, subject and date",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create attendance",
      error: error.message,
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};

// GET ATTENDANCE BY ID
export const getAttendanceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const attendance = await Attendance.findById(req.params.id)
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
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

    const attendance = await Attendance.find({
      student: studentId,
    })
      .populate("subject")
      .populate("faculty")
      .sort({ date: -1 });

    const totalClasses = attendance.length;

    const presentClasses = attendance.filter(
      (record: { status: string }) => record.status === "present"
    ).length;

    const absentClasses = attendance.filter(
      (record: { status: string }) => record.status === "absent"
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
      error: error.message,
    });
  }
};

// UPDATE ATTENDANCE
export const updateAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;

    if (
      status !== undefined &&
      !["present", "absent"].includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: "Status must be present or absent",
      });
      return;
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

// DELETE ATTENDANCE
export const deleteAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const attendance = await Attendance.findByIdAndDelete(
      req.params.id
    );

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
    res.status(500).json({
      success: false,
      message: "Failed to delete attendance",
      error: error.message,
    });
  }
};