import { Request, Response } from "express";
import mongoose from "mongoose";
import Complaint from "../models/Complaint";
import Student from "../models/Student";
import User from "../models/User";

// 1. Create a complaint
export const createComplaint = async (req: Request, res: Response) => {
  try {
    const {
      student,
      title,
      description,
      category = "other",
      isAnonymous = false,
    } = req.body;

    if (!student || !title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student, title, and description are required",
      });
    }

    if (!mongoose.isValidObjectId(student)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const validCategories = [
      "academic",
      "attendance",
      "fees",
      "faculty",
      "infrastructure",
      "harassment",
      "other",
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint category",
      });
    }

    const studentExists = await Student.findById(student);

    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const complaint = await Complaint.create({
      student,
      title: title.trim(),
      description: description.trim(),
      category,
      isAnonymous: Boolean(isAnonymous),
    });

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit complaint",
    });
  }
};

// 2. Get all complaints (restrict to authorized staff in production)
export const getAllComplaints = async (_req: Request, res: Response) => {
  try {
    const complaints = await Complaint.find()
      .populate("student", "rollNumber department")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
    });
  }
};

// 3. Get complaints submitted by one student
export const getStudentComplaints = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const complaints = await Complaint.find({ student: studentId })
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Get student complaints error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student complaints",
    });
  }
};

// 4. Assign a complaint to a staff member/coordinator
export const assignComplaint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!mongoose.isValidObjectId(id) ||
        !mongoose.isValidObjectId(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Valid complaint ID and assigned staff user ID are required",
      });
    }

    const staff = await User.findById(assignedTo);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff user not found",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { assignedTo, status: "assigned" },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint assigned successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Assign complaint error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign complaint",
    });
  }
};

// 5. Update complaint status or resolution
export const updateComplaintStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status, resolution, priority } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    const validStatuses = [
      "pending",
      "assigned",
      "in_progress",
      "resolved",
      "rejected",
    ];

    const validPriorities = ["low", "medium", "high", "urgent"];

    const updates: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid complaint status",
        });
      }
      updates.status = status;
    }

    if (priority !== undefined) {
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid complaint priority",
        });
      }
      updates.priority = priority;
    }

    if (resolution !== undefined) {
      if (typeof resolution !== "string") {
        return res.status(400).json({
          success: false,
          message: "Resolution must be a string",
        });
      }
      updates.resolution = resolution.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Update complaint error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update complaint",
    });
  }
};

// 6. Delete a complaint (restrict to authorized staff in production)
export const deleteComplaint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Delete complaint error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete complaint",
    });
  }
};