import { Request, Response } from "express";
import Enrollment from "../models/Enrollment";

// CREATE ENROLLMENT
export const createEnrollment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      student,
      subject,
      faculty,
      semester,
      academicYear,
    } = req.body;

    if (
      !student ||
      !subject ||
      !faculty ||
      semester === undefined ||
      !academicYear
    ) {
      res.status(400).json({
        success: false,
        message:
          "Student, subject, faculty, semester and academic year are required",
      });
      return;
    }

    const existingEnrollment = await Enrollment.findOne({
      student,
      subject,
      academicYear,
    });

    if (existingEnrollment) {
      res.status(400).json({
        success: false,
        message:
          "Student is already enrolled in this subject for this academic year",
      });
      return;
    }

    const enrollment = await Enrollment.create({
      student,
      subject,
      faculty,
      semester,
      academicYear,
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("student")
      .populate("subject")
      .populate("faculty");

    res.status(201).json({
      success: true,
      message: "Enrollment created successfully",
      data: populatedEnrollment,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message:
          "Student is already enrolled in this subject for this academic year",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create enrollment",
      error: error.message,
    });
  }
};

// GET ALL ENROLLMENTS
export const getAllEnrollments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student")
      .populate("subject")
      .populate("faculty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
      error: error.message,
    });
  }
};

// GET ENROLLMENT BY ID
export const getEnrollmentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student")
      .populate("subject")
      .populate("faculty");

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment",
      error: error.message,
    });
  }
};

// UPDATE ENROLLMENT
export const updateEnrollment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("student")
      .populate("subject")
      .populate("faculty");

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      data: enrollment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update enrollment",
      error: error.message,
    });
  }
};

// DELETE ENROLLMENT
export const deleteEnrollment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete enrollment",
      error: error.message,
    });
  }
};