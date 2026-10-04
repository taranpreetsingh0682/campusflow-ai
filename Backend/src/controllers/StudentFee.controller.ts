import { Request, Response } from "express";
import StudentFee from "../models/StudentFee";

// CREATE STUDENT FEE
export const createStudentFee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      student,
      feeStructure,
      scholarship,
      academicYear,
      totalFee,
      scholarshipAmount = 0,
      fine = 0,
      paidAmount = 0,
    } = req.body;

    if (
      !student ||
      !feeStructure ||
      !academicYear ||
      totalFee === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "Student, fee structure, academic year and total fee are required",
      });
      return;
    }

    if (totalFee < 0 || scholarshipAmount < 0 || fine < 0 || paidAmount < 0) {
      res.status(400).json({
        success: false,
        message: "Fee amounts cannot be negative",
      });
      return;
    }

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

    if (paidAmount === payableAmount) {
      status = "paid";
    } else if (paidAmount > 0) {
      status = "partial";
    }

    const noDues = pendingAmount === 0;

    const studentFee = await StudentFee.create({
      student,
      feeStructure,
      scholarship,
      academicYear,
      totalFee,
      scholarshipAmount,
      fine,
      payableAmount,
      paidAmount,
      pendingAmount,
      status,
      noDues,
    });

    const populatedStudentFee = await StudentFee.findById(studentFee._id)
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch student fees",
      error: error.message,
    });
  }
};

// GET STUDENT FEE BY ID
export const getStudentFeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

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
    const { id } = req.params;

    const existingFee = await StudentFee.findById(id);

    if (!existingFee) {
      res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
      return;
    }

    const totalFee =
      req.body.totalFee !== undefined
        ? req.body.totalFee
        : existingFee.totalFee;

    const scholarshipAmount =
      req.body.scholarshipAmount !== undefined
        ? req.body.scholarshipAmount
        : existingFee.scholarshipAmount;

    const fine =
      req.body.fine !== undefined ? req.body.fine : existingFee.fine;

    const paidAmount =
      req.body.paidAmount !== undefined
        ? req.body.paidAmount
        : existingFee.paidAmount;

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

    if (paidAmount === payableAmount) {
      status = "paid";
    } else if (paidAmount > 0) {
      status = "partial";
    }

    const noDues = pendingAmount === 0;

    const studentFee = await StudentFee.findByIdAndUpdate(
      id,
      {
        ...req.body,
        totalFee,
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
    const { id } = req.params;

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
    res.status(500).json({
      success: false,
      message: "Failed to delete student fee",
      error: error.message,
    });
  }
};