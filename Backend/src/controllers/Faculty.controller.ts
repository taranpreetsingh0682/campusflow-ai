import { Request, Response } from "express";
import Faculty from "../models/Faculty";

// CREATE FACULTY
export const createFaculty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      user,
      employeeId,
      departments,
      subjects = [],
    } = req.body;

    if (!user || !employeeId || !departments || departments.length === 0) {
      res.status(400).json({
        success: false,
        message: "User, employee ID and departments are required",
      });
      return;
    }

    const existingFaculty = await Faculty.findOne({
      $or: [{ user }, { employeeId }],
    });

    if (existingFaculty) {
      res.status(400).json({
        success: false,
        message: "Faculty already exists for this user or employee ID",
      });
      return;
    }

    const faculty = await Faculty.create({
      user,
      employeeId,
      departments,
      subjects,
    });

    const populatedFaculty = await Faculty.findById(faculty._id)
      .populate("user")
      .populate("departments")
      .populate("subjects");

    res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      data: populatedFaculty,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Faculty user or employee ID already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create faculty",
      error: error.message,
    });
  }
};

// GET ALL FACULTY
export const getAllFaculty = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const faculty = await Faculty.find()
      .populate("user")
      .populate("departments")
      .populate("subjects")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty",
      error: error.message,
    });
  }
};

// GET FACULTY BY ID
export const getFacultyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate("user")
      .populate("departments")
      .populate("subjects");

    if (!faculty) {
      res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty",
      error: error.message,
    });
  }
};

// UPDATE FACULTY
export const updateFaculty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("user")
      .populate("departments")
      .populate("subjects");

    if (!faculty) {
      res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
      data: faculty,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update faculty",
      error: error.message,
    });
  }
};

// DELETE FACULTY
export const deleteFaculty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Faculty deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete faculty",
      error: error.message,
    });
  }
};