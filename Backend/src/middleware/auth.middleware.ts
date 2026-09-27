import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    (req as any).user = decoded;

    next();
  } catch (error: any) {
    console.error("JWT ERROR:", error.name);
    console.error("JWT MESSAGE:", error.message);

    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token expired. Please login again."
          : "Invalid token",
    });
  }
};