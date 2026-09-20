import { Request,Response } from "express";

export const adminDashboard =async(
  req: Request,
  res: Response

)=>{
  return res.status(200).json({
    success: true,
    message: "Welcome to the Admin Dashboard",
    user: (req as any).user,
  });
};