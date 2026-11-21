
import { Request, Response } from "express";
import mongoose from "mongoose";
import Student from "../models/Student";
import SemesterResult from "../models/SemesterResult";

// ADMIN: Add or update semester results using student roll number
export const saveStudentResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { rollNumber, results } = req.body;

    if (
      typeof rollNumber !== "string" ||
      !rollNumber.trim() ||
      !Array.isArray(results) ||
      results.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Roll number and results array are required",
      });
      return;
    }

    const student = await Student.findOne({
      rollNumber: rollNumber.trim(),
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: "Student not found with this roll number",
      });
      return;
    }

    const seenSemesters = new Set<number>();

    for (const result of results) {
      if (
        !Number.isInteger(result.semester) ||
        result.semester < 1 ||
        result.semester > 8 ||
        typeof result.sgpa !== "number" ||
        !Number.isFinite(result.sgpa) ||
        result.sgpa < 0 ||
        result.sgpa > 10 ||
        seenSemesters.has(result.semester)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid or duplicate semester/SGPA value",
        });
        return;
      }

      seenSemesters.add(result.semester);
    }

    const savedResults = [];

    for (const result of results) {
      const saved = await SemesterResult.findOneAndUpdate(
        {
          student: student._id,
          semester: result.semester,
        },
        {
          $set: {
            sgpa: result.sgpa,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      savedResults.push(saved);
    }

    res.status(200).json({
      success: true,
      message: "Semester results saved successfully",
      student: {
        rollNumber: student.rollNumber,
      },
      count: savedResults.length,
      data: savedResults,
    });
  } catch (error: any) {
    console.error("Save semester results error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save semester results",
    });
  }
};

// STUDENT: Get only their own semester results
export const getMySemesterResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    const student = await Student.findOne({ user: userId });

    if (!student) {
      res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
      return;
    }

    const results = await SemesterResult.find({
      student: student._id,
    }).sort({ semester: 1 });

    const totalSGPA = results.reduce(
      (sum, result) => sum + result.sgpa,
      0
    );

    const averageSGPA =
      results.length > 0
        ? Number((totalSGPA / results.length).toFixed(2))
        : 0;

    res.status(200).json({
      success: true,
      student: {
        rollNumber: student.rollNumber,
        currentSemester: student.semester,
      },
      summary: {
        totalSemesters: results.length,
        averageSGPA,
      },
      data: results,
    });
  } catch (error: any) {
    console.error("Get my semester results error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch semester results",
    });
  }
};
