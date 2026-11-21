
import { Request, Response } from "express";
import mongoose from "mongoose";
import Marks from "../models/Marks";
import Student from "../models/Student";
import Subject from "../models/Subject";
import Faculty from "../models/Faculty";
import Enrollment from "../models/Enrollment";

// =====================================================
// CREATE MARKS
// =====================================================
export const createMarks = async (req: Request, res: Response) => {
  try {
    const {
      student,
      subject,
      faculty,
      semester,
      academicYear,
      marks,
      maxMarks,
      assessmentType,
    } = req.body;

    if (
      !student ||
      !subject ||
      !faculty ||
      semester === undefined ||
      !academicYear ||
      marks === undefined ||
      maxMarks === undefined ||
      !assessmentType
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(student) ||
      !mongoose.Types.ObjectId.isValid(subject) ||
      !mongoose.Types.ObjectId.isValid(faculty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid student, subject or faculty ID",
      });
    }

    const validAssessmentTypes = [
      "sessional",
      "assignment",
      "practical",
      "internal",
    ];

    if (!validAssessmentTypes.includes(assessmentType)) {
      return res.status(400).json({
        success: false,
        message:
          "Assessment type must be sessional, assignment, practical or internal",
      });
    }

    if (typeof marks !== "number" || typeof maxMarks !== "number") {
      return res.status(400).json({
        success: false,
        message: "Marks and maxMarks must be numbers",
      });
    }

    if (marks < 0) {
      return res.status(400).json({
        success: false,
        message: "Marks cannot be negative",
      });
    }

    if (maxMarks <= 0) {
      return res.status(400).json({
        success: false,
        message: "maxMarks must be greater than 0",
      });
    }

    if (marks > maxMarks) {
      return res.status(400).json({
        success: false,
        message: "Marks cannot be greater than maxMarks",
      });
    }

    if (semester < 1 || semester > 8) {
      return res.status(400).json({
        success: false,
        message: "Semester must be between 1 and 8",
      });
    }

    const studentExists = await Student.findById(student);

    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const subjectExists = await Subject.findById(subject);

    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const facultyExists = await Faculty.findById(faculty);

    if (!facultyExists) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    if (studentExists.semester !== semester) {
      return res.status(400).json({
        success: false,
        message: "Student semester does not match marks semester",
      });
    }

    if (subjectExists.semester !== semester) {
      return res.status(400).json({
        success: false,
        message: "Subject semester does not match marks semester",
      });
    }

    const enrollmentExists = await Enrollment.findOne({
      student,
      subject,
      faculty,
      semester,
      academicYear,
    });

    if (!enrollmentExists) {
      return res.status(400).json({
        success: false,
        message:
          "Student is not enrolled in this subject with this faculty for the given semester and academic year",
      });
    }

    const existingMarks = await Marks.findOne({
      student,
      subject,
      assessmentType,
      academicYear,
    });

    if (existingMarks) {
      return res.status(409).json({
        success: false,
        message:
          "Marks already exist for this student, subject, assessment type and academic year",
      });
    }

    const newMarks = await Marks.create({
      student,
      subject,
      faculty,
      semester,
      academicYear,
      marks,
      maxMarks,
      assessmentType,
    });

    const populatedMarks = await Marks.findById(newMarks._id)
      .populate("student")
      .populate("subject")
      .populate("faculty");

    return res.status(201).json({
      success: true,
      message: "Marks created successfully",
      data: populatedMarks,
    });
  } catch (error: any) {
    console.error("Create Marks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create marks",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL MARKS
// =====================================================
export const getAllMarks = async (_req: Request, res: Response) => {
  try {
    const marks = await Marks.find()
      .populate("student")
      .populate("subject")
      .populate("faculty")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: marks.length,
      data: marks,
    });
  } catch (error: any) {
    console.error("Get All Marks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch marks",
      error: error.message,
    });
  }
};

// =====================================================
// GET MARKS BY ID
// =====================================================
export const getMarksById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid marks ID",
      });
    }

    const marks = await Marks.findById(id)
      .populate("student")
      .populate("subject")
      .populate("faculty");

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: "Marks not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: marks,
    });
  } catch (error: any) {
    console.error("Get Marks By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch marks",
      error: error.message,
    });
  }
};

// =====================================================
// GET STUDENT MARKS BY STUDENT ID
// ADMIN / HOD ACCESS
// =====================================================
export const getStudentMarks = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    if (
      typeof studentId !== "string" ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const marks = await Marks.find({
      student: studentId,
    })
      .populate("subject")
      .populate("faculty")
      .sort({
        academicYear: 1,
        semester: 1,
        createdAt: 1,
      });

    let totalMarksObtained = 0;
    let totalMaximumMarks = 0;

    marks.forEach((item) => {
      totalMarksObtained += item.marks;
      totalMaximumMarks += item.maxMarks;
    });

    const percentage =
      totalMaximumMarks > 0
        ? Number(
            ((totalMarksObtained / totalMaximumMarks) * 100).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      studentId,
      summary: {
        totalAssessments: marks.length,
        totalMarksObtained,
        totalMaximumMarks,
        percentage,
      },
      data: marks,
    });
  } catch (error: any) {
    console.error("Get Student Marks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student marks",
      error: error.message,
    });
  }
};

// =====================================================
// GET LOGGED-IN STUDENT'S OWN RESULTS
// STUDENT ACCESS
// =====================================================
export const getMyStudentMarks = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const userId = authUser?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication",
      });
    }

    // Find Student profile using authenticated User ID
    const student = await Student.findOne({
      user: userId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Fetch only the logged-in student's marks
    const marks = await Marks.find({
      student: student._id,
    })
      .populate("subject")
      .populate("faculty")
      .sort({
        academicYear: 1,
        semester: 1,
        createdAt: 1,
      });

    let totalMarksObtained = 0;
    let totalMaximumMarks = 0;

    marks.forEach((item) => {
      totalMarksObtained += item.marks;
      totalMaximumMarks += item.maxMarks;
    });

    const percentage =
      totalMaximumMarks > 0
        ? Number(
            ((totalMarksObtained / totalMaximumMarks) * 100).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      student: {
        rollNumber: student.rollNumber,
        semester: student.semester,
      },
      summary: {
        totalAssessments: marks.length,
        totalMarksObtained,
        totalMaximumMarks,
        percentage,
      },
      data: marks,
    });
  } catch (error: any) {
    console.error("Get My Student Marks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your results",
    });
  }
};

// =====================================================
// UPDATE MARKS
// =====================================================
export const updateMarks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid marks ID",
      });
    }

    const existingMarks = await Marks.findById(id);

    if (!existingMarks) {
      return res.status(404).json({
        success: false,
        message: "Marks not found",
      });
    }

    const { marks, maxMarks, assessmentType } = req.body;

    if (marks !== undefined) {
      if (typeof marks !== "number" || marks < 0) {
        return res.status(400).json({
          success: false,
          message: "Marks must be a valid non-negative number",
        });
      }
    }

    if (maxMarks !== undefined) {
      if (typeof maxMarks !== "number" || maxMarks <= 0) {
        return res.status(400).json({
          success: false,
          message: "maxMarks must be greater than 0",
        });
      }
    }

    const finalMarks =
      marks !== undefined ? marks : existingMarks.marks;

    const finalMaxMarks =
      maxMarks !== undefined
        ? maxMarks
        : existingMarks.maxMarks;

    if (finalMarks > finalMaxMarks) {
      return res.status(400).json({
        success: false,
        message: "Marks cannot be greater than maxMarks",
      });
    }

    if (assessmentType !== undefined) {
      const validAssessmentTypes = [
        "sessional",
        "assignment",
        "practical",
        "internal",
      ];

      if (!validAssessmentTypes.includes(assessmentType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assessment type",
        });
      }

      if (assessmentType !== existingMarks.assessmentType) {
        const duplicate = await Marks.findOne({
          _id: { $ne: id },
          student: existingMarks.student,
          subject: existingMarks.subject,
          assessmentType,
          academicYear: existingMarks.academicYear,
        });

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message:
              "Another marks record already exists for this assessment type",
          });
        }
      }
    }

    existingMarks.marks = finalMarks;
    existingMarks.maxMarks = finalMaxMarks;

    if (assessmentType !== undefined) {
      existingMarks.assessmentType = assessmentType;
    }

    await existingMarks.save();

    const updatedMarks = await Marks.findById(id)
      .populate("student")
      .populate("subject")
      .populate("faculty");

    return res.status(200).json({
      success: true,
      message: "Marks updated successfully",
      data: updatedMarks,
    });
  } catch (error: any) {
    console.error("Update Marks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update marks",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE MARKS
// =====================================================
export const deleteMarks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid marks ID",
      });
    }

    const marks = await Marks.findById(id);

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: "Marks not found",
      });
    }

    await Marks.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Marks deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Marks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete marks",
      error: error.message,
    });
  }
};
