import { Request, Response } from "express";
import Student from "../models/Student";

// CREATE STUDENT
export const createStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      user,
      rollNumber,
      department,
      semester,
      section,
      admissionYear,
    } = req.body;

    // Required fields
    if (
      !user ||
      !rollNumber ||
      !department ||
      semester === undefined ||
      !admissionYear
    ) {
      res.status(400).json({
        success: false,
        message:
          "User, roll number, department, semester and admission year are required",
      });
      return;
    }

    // Check if user already has a student profile
    const existingStudent = await Student.findOne({ user });

    if (existingStudent) {
      res.status(400).json({
        success: false,
        message: "Student profile already exists for this user",
      });
      return;
    }

    // Check roll number
    const existingRollNumber = await Student.findOne({ rollNumber });

    if (existingRollNumber) {
      res.status(400).json({
        success: false,
        message: "Roll number already exists",
      });
      return;
    }

    const student = await Student.create({
      user,
      rollNumber,
      department,
      semester,
      section,
      admissionYear,
    });

    const populatedStudent = await Student.findById(student._id)
      .populate("user", "name email role")
      .populate("department", "name code");

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: populatedStudent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create student",
      error: error.message,
    });
  }
};

// GET STUDENT PROFILE
export const getStudentProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "name email role")
      .populate("department", "name code");

    if (!student) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};