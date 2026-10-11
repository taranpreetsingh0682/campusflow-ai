
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      college,
      department,
      academicYear,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !college ||
      !department ||
      academicYear === undefined ||
      academicYear === null ||
      academicYear === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, college, department and academic year are required",
      });
    }

    // Validate input types
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof college !== "string" ||
      typeof department !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCollege = college.trim();
    const normalizedDepartment = department.trim();
    const year = Number(academicYear);

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedCollege ||
      !normalizedDepartment
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields",
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate academic year
    if (!Number.isInteger(year) || year < 1 || year > 4) {
      return res.status(400).json({
        success: false,
        message: "Academic year must be between 1 and 4",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    // Check whether the email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Public registration always creates a student account.
    // Privileged roles must be assigned through a trusted admin process.
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      college: normalizedCollege,
      department: normalizedDepartment,
      academicYear: year,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        academicYear: user.academicYear,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate email errors safely
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find the user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Ensure the JWT secret is configured
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is missing from environment variables");

      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Generate the authentication token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        department: user.department,
      },
      jwtSecret,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        academicYear: user.academicYear,
        rollNumber: user.rollNumber,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
