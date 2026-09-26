import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("========== JWT DEBUG ==========");
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.substring(7);

    console.log("Token received:", token);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    console.log("JWT verified successfully");
    console.log("Decoded JWT:", decoded);

    (req as any).user = decoded;

    next();
  } catch (error) {
    console.error("========== JWT ERROR ==========");
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};