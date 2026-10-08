import { Request, Response } from "express";

import Subject from "../models/Subject";

// CREATE SUBJECT
export const createSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      code,
      department,
      semester,
      faculty = [],
    } = req.body;

    if (
      !name ||
      !code ||
      !department ||
      semester === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, code, department and semester are required",
      });
      return;
    }

    const existingSubject = await Subject.findOne({ code });

    if (existingSubject) {
      res.status(400).json({
        success: false,
        message: "Subject with this code already exists",
      });
      return;
    }

    const subject = await Subject.create({
      name,
      code,
      department,
      semester,
      faculty,
    });

    const populatedSubject = await Subject.findById(subject._id)
      .populate("department", "name code")
      .populate("faculty");

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: populatedSubject,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Subject code already exists",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create subject",
      error: error.message,
    });
  }
};

// GET ALL SUBJECTS
export const getAllSubjects = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const subjects = await Subject.find()
      .populate("department", "name code")
      .populate("faculty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
};

// GET SUBJECT BY ID
export const getSubjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("department", "name code")
      .populate("faculty");

    if (!subject) {
      res.status(404).json({
        success: false,
        message: "Subject not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subject",
      error: error.message,
    });
  }
};

// UPDATE SUBJECT
export const updateSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("department", "name code")
      .populate("faculty");

    if (!subject) {
      res.status(404).json({
        success: false,
        message: "Subject not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update subject",
      error: error.message,
    });
  }
};

// DELETE SUBJECT
export const deleteSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      res.status(404).json({
        success: false,
        message: "Subject not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete subject",
      error: error.message,
    });
  }
};