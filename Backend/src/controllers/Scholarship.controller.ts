import { Request, Response } from "express";
import Scholarship from "../models/Scholarship";

// CREATE SCHOLARSHIP
export const createScholarship = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      student,
      name,
      type,
      value,
      academicYear,
      status,
    } = req.body;

    // Required field validation
    if (
      !student ||
      !name ||
      !type ||
      value === undefined ||
      !academicYear
    ) {
      res.status(400).json({
        success: false,
        message:
          "Student, name, type, value and academic year are required",
      });
      return;
    }

    // Validate scholarship type
    if (type !== "percentage" && type !== "fixed") {
      res.status(400).json({
        success: false,
        message: "Type must be either percentage or fixed",
      });
      return;
    }

    // Validate value
    if (value < 0) {
      res.status(400).json({
        success: false,
        message: "Scholarship value cannot be negative",
      });
      return;
    }

    const scholarship = await Scholarship.create({
      student,
      name,
      type,
      value,
      academicYear,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Scholarship created successfully",
      data: scholarship,
    });
  } catch (error: any) {
    // Duplicate student + academic year
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message:
          "Scholarship already exists for this student and academic year",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create scholarship",
      error: error.message,
    });
  }
};

// GET ALL SCHOLARSHIPS
export const getAllScholarships = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const scholarships = await Scholarship.find()
      .populate("student")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: scholarships.length,
      data: scholarships,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch scholarships",
      error: error.message,
    });
  }
};

// GET SCHOLARSHIP BY ID
export const getScholarshipById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findById(id).populate("student");

    if (!scholarship) {
      res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch scholarship",
      error: error.message,
    });
  }
};

// UPDATE SCHOLARSHIP
export const updateScholarship = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("student");

    if (!scholarship) {
      res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Scholarship updated successfully",
      data: scholarship,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update scholarship",
      error: error.message,
    });
  }
};

// DELETE SCHOLARSHIP
export const deleteScholarship = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findByIdAndDelete(id);

    if (!scholarship) {
      res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Scholarship deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete scholarship",
      error: error.message,
    });
  }
};