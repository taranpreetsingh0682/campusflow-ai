
import { Request, Response } from "express";
import User from "../models/User";

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

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};
