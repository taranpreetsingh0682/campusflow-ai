
import { Request, Response } from "express";
import mongoose from "mongoose";
import StudentFee from "../models/StudentFee";
import Student from "../models/Student";
import FeeStructure from "../models/FeeStructure";

// CREATE STUDENT FEE
export const createStudentFee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      student,
      feeStructure,
      academicYear,
      scholarshipAmount = 0,
      fine = 0,
      paidAmount = 0,
    } = req.body;

    if (!student || !feeStructure || !academicYear) {
      res.status(400).json({
        success: false,
        message: "Student, fee structure and academic year are required",
      });
      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(student) ||
      !mongoose.Types.ObjectId.isValid(feeStructure)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid student or fee structure ID",
      });
      return;
    }

    if (
      ![scholarshipAmount, fine, paidAmount].every(
        (amount) =>
          typeof amount === "number" &&
          Number.isFinite(amount) &&
          amount >= 0
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Fee amounts must be valid non-negative numbers",
      });
      return;
    }

    // Find actual student
    const studentRecord = await Student.findById(student);

    if (!studentRecord) {
      res.status(404).json({
        success: false,
        message: "Student not found",
      });
      return;
    }

    // Find actual fee structure
    const structure = await FeeStructure.findById(feeStructure);

    if (!structure) {
      res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
      return;
    }

    // Verify department and semester
    if (
      studentRecord.department.toString() !==
        structure.department.toString() ||
      studentRecord.semester !== structure.semester
    ) {
      res.status(400).json({
        success: false,
        message:
          "Fee structure does not match student's department and semester",
      });
      return;
    }

    // Verify academic year
    if (academicYear !== structure.academicYear) {
      res.status(400).json({
        success: false,
        message: "Academic year does not match fee structure",
      });
      return;
    }

    // Do not allow unverified scholarship discounts
    if (scholarshipAmount !== 0) {
      res.status(400).json({
        success: false,
        message:
          "Scholarship discount cannot be added without an approved scholarship",
      });
      return;
    }

    // Check existing fee
    const existingStudentFee = await StudentFee.findOne({
      student,
      feeStructure,
      academicYear,
    });

    if (existingStudentFee) {
      res.status(400).json({
        success: false,
        message:
          "Student fee already exists for this student, fee structure and academic year",
      });
      return;
    }

    // Always use the actual fee from database
    const totalFee = structure.totalFee;

    const payableAmount = Math.max(
      0,
      totalFee - scholarshipAmount + fine
    );

    if (paidAmount > payableAmount) {
      res.status(400).json({
        success: false,
        message: "Paid amount cannot be greater than payable amount",
      });
      return;
    }

    const pendingAmount = payableAmount - paidAmount;

    let status: "pending" | "partial" | "paid" = "pending";

    if (pendingAmount === 0) {
      status = "paid";
    } else if (paidAmount > 0) {
      status = "partial";
    }

    const noDues = pendingAmount === 0;

    const studentFee = await StudentFee.create({
      student,
      feeStructure,
      academicYear,
      totalFee,
      scholarshipAmount: 0,
      fine,
      payableAmount,
      paidAmount,
      pendingAmount,
      status,
      noDues,
    });

    const populatedStudentFee = await StudentFee.findById(
      studentFee._id
    )
      .populate("student")
      .populate("feeStructure")
      .populate("scholarship");

    res.status(201).json({
      success: true,
      message: "Student fee created successfully",
      data: populatedStudentFee,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message:
          "Student fee already exists for this student, fee structure and academic year",
      });
      return;
    }

    console.error("Create student fee error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create student fee",
      error: error.message,
    });
  }
};

// GET ALL STUDENT FEES
export const getAllStudentFees = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentFees = await StudentFee.find()
      .populate("student")
      .populate("feeStructure")
      .populate("scholarship")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: studentFees.length,
      data: studentFees,
    });
  } catch (error: any) {
    console.error("Get all student fees error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student fees",
      error: error.message,
    });
  }
};

// GET MY STUDENT FEES
export const getMyStudentFees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authUser = (req as any).user;
    const userId = authUser?.id || authUser?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    const student = await Student.findOne({
      user: userId,
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: "No student profile is linked to this account",
      });
      return;
    }

    const studentFees = await StudentFee.find({
      student: student._id,
    })
      .populate("feeStructure")
      .populate("scholarship")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: studentFees.length,
      data: studentFees,
    });
  } catch (error: any) {
    console.error("Get my student fees error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your fees",
    });
  }
};

// GET STUDENT FEE BY ID
export const getStudentFeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid student fee ID",
      });
      return;
    }

    const studentFee = await StudentFee.findById(id)
      .populate("student")
      .populate("feeStructure")
      .populate("scholarship");

    if (!studentFee) {
      res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: studentFee,
    });
  } catch (error: any) {
    console.error("Get student fee by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student fee",
      error: error.message,
    });
  }
};

// UPDATE STUDENT FEE
export const updateStudentFee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid student fee ID",
      });
      return;
    }

    const existingFee = await StudentFee.findById(id);

    if (!existingFee) {
      res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
      return;
    }

    const totalFee = existingFee.totalFee;

    const scholarshipAmount =
      req.body.scholarshipAmount !== undefined
        ? req.body.scholarshipAmount
        : existingFee.scholarshipAmount;

    const fine =
      req.body.fine !== undefined
        ? req.body.fine
        : existingFee.fine;

    const paidAmount =
      req.body.paidAmount !== undefined
        ? req.body.paidAmount
        : existingFee.paidAmount;

    if (
      ![scholarshipAmount, fine, paidAmount].every(
        (amount) =>
          typeof amount === "number" &&
          Number.isFinite(amount) &&
          amount >= 0
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Fee amounts must be valid non-negative numbers",
      });
      return;
    }

    if (
      scholarshipAmount > 0 &&
      !existingFee.scholarship
    ) {
      res.status(400).json({
        success: false,
        message: "An approved scholarship is required for a discount",
      });
      return;
    }

    const payableAmount = Math.max(
      0,
      totalFee - scholarshipAmount + fine
    );

    if (paidAmount > payableAmount) {
      res.status(400).json({
        success: false,
        message: "Paid amount cannot be greater than payable amount",
      });
      return;
    }

    const pendingAmount = payableAmount - paidAmount;

    let status: "pending" | "partial" | "paid" = "pending";

    if (pendingAmount === 0) {
      status = "paid";
    } else if (paidAmount > 0) {
      status = "partial";
    }

    const noDues = pendingAmount === 0;

    const studentFee = await StudentFee.findByIdAndUpdate(
      id,
      {
        scholarshipAmount,
        fine,
        payableAmount,
        paidAmount,
        pendingAmount,
        status,
        noDues,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("student")
      .populate("feeStructure")
      .populate("scholarship");

    res.status(200).json({
      success: true,
      message: "Student fee updated successfully",
      data: studentFee,
    });
  } catch (error: any) {
    console.error("Update student fee error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update student fee",
      error: error.message,
    });
  }
};

// DELETE STUDENT FEE
export const deleteStudentFee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid student fee ID",
      });
      return;
    }

    const studentFee = await StudentFee.findByIdAndDelete(id);

    if (!studentFee) {
      res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Student fee deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete student fee error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete student fee",
      error: error.message,
    });
  }
};
