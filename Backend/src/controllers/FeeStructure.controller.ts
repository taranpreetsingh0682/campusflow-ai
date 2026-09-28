import { Request, Response } from "express";
import FeeStructure from "../models/FeeStructure";

// Create a new fee structure
export const createFeeStructure = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      department,
      semester,
      academicYear,
      tuitionFee,
      examFee,
      libraryFee,
      otherFee,
    } = req.body;

    // Validate required fields
    if (
      !department ||
      !semester ||
      !academicYear ||
      tuitionFee === undefined ||
      examFee === undefined ||
      libraryFee === undefined ||
      otherFee === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "All fee structure fields are required",
      });
      return;
    }

    // Check duplicate fee structure
    const existingFeeStructure = await FeeStructure.findOne({
      department,
      semester,
      academicYear,
    });

    if (existingFeeStructure) {
      res.status(409).json({
        success: false,
        message:
          "Fee structure already exists for this department, semester and academic year",
      });
      return;
    }

    const feeStructure = await FeeStructure.create({
      department,
      semester,
      academicYear,
      tuitionFee,
      examFee,
      libraryFee,
      otherFee,
    });

    await feeStructure.populate("department");

    res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      data: feeStructure,
    });
  } catch (error: any) {
    console.error("Create Fee Structure Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create fee structure",
      error: error.message,
    });
  }
};

// Get all fee structures
export const getAllFeeStructures = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const feeStructures = await FeeStructure.find()
      .populate("department")
      .sort({
        academicYear: -1,
        semester: 1,
      });

    res.status(200).json({
      success: true,
      count: feeStructures.length,
      data: feeStructures,
    });
  } catch (error: any) {
    console.error("Get Fee Structures Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fee structures",
      error: error.message,
    });
  }
};

// Get fee structure by ID
export const getFeeStructureById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const feeStructure = await FeeStructure.findById(id).populate(
      "department"
    );

    if (!feeStructure) {
      res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: feeStructure,
    });
  } catch (error: any) {
    console.error("Get Fee Structure Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fee structure",
      error: error.message,
    });
  }
};

// Get fee structure by department, semester and academic year
export const getFeeStructureByDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { department, semester, academicYear } = req.query;

    if (!department || !semester || !academicYear) {
      res.status(400).json({
        success: false,
        message:
          "Department, semester and academic year are required",
      });
      return;
    }

    const feeStructure = await FeeStructure.findOne({
      department: String(department),
      semester: Number(semester),
      academicYear: String(academicYear),
    }).populate("department");

    if (!feeStructure) {
      res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: feeStructure,
    });
  } catch (error: any) {
    console.error("Get Fee Structure By Details Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fee structure",
      error: error.message,
    });
  }
};

// Update fee structure
export const updateFeeStructure = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const {
      department,
      semester,
      academicYear,
      tuitionFee,
      examFee,
      libraryFee,
      otherFee,
    } = req.body;

    const feeStructure = await FeeStructure.findById(id);

    if (!feeStructure) {
      res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
      return;
    }

    // Update only provided fields
    if (department !== undefined) {
      feeStructure.department = department;
    }

    if (semester !== undefined) {
      feeStructure.semester = semester;
    }

    if (academicYear !== undefined) {
      feeStructure.academicYear = academicYear;
    }

    if (tuitionFee !== undefined) {
      feeStructure.tuitionFee = tuitionFee;
    }

    if (examFee !== undefined) {
      feeStructure.examFee = examFee;
    }

    if (libraryFee !== undefined) {
      feeStructure.libraryFee = libraryFee;
    }

    if (otherFee !== undefined) {
      feeStructure.otherFee = otherFee;
    }

    // totalFee is automatically recalculated
    // by the model before validation

    await feeStructure.save();

    await feeStructure.populate("department");

    res.status(200).json({
      success: true,
      message: "Fee structure updated successfully",
      data: feeStructure,
    });
  } catch (error: any) {
    console.error("Update Fee Structure Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update fee structure",
      error: error.message,
    });
  }
};

// Delete fee structure
export const deleteFeeStructure = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const feeStructure = await FeeStructure.findByIdAndDelete(id);

    if (!feeStructure) {
      res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Fee structure deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Fee Structure Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete fee structure",
      error: error.message,
    });
  }
};