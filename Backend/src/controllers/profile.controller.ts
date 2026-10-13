
import { Request, Response } from "express";
import User from "../models/User";
import Student from "../models/Student";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;

    if (!authUser?.id && !authUser?._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const userId = authUser.id || authUser._id;

    // Fetch the authenticated user's profile
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the Student document linked to this User
    const student = await Student.findOne({
      user: user._id,
    })
      .populate("department", "name code")
      .lean();

    // Include studentId in the user object for the existing frontend
    const userWithStudent = {
      ...user.toObject(),
      studentId: student?._id?.toString() || null,
      student: student
        ? {
            ...student,
            _id: student._id.toString(),
            user: student.user.toString(),
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: userWithStudent,
      student: student
        ? {
            ...student,
            _id: student._id.toString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};
