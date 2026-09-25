import { Request, Response } from "express";
import Student from "../models/Student";

export const getStudentProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "name email role")
      .populate("department", "name code");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};