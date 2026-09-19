import { Request, Response } from "express";

export const getProfile = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Profile accessed successfully",
      user: (req as any).user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};