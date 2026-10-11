
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

function createAuthToken(user: InstanceType<typeof User>): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing from environment variables");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      department: user.department,
    },
    jwtSecret,
    { expiresIn: "1d" }
  );
}

function serializeUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    department: user.department,
    academicYear: user.academicYear,
    rollNumber: user.rollNumber,
  };
}

// Register using email and password
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

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof college !== "string" ||
      typeof department !== "string" ||
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

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCollege = college.trim();
    const normalizedDepartment = department.trim();
    const year = Number(academicYear);

    if (
      !normalizedName ||
      !normalizedCollege ||
      !normalizedDepartment
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    if (!Number.isInteger(year) || year < 1 || year > 4) {
      return res.status(400).json({
        success: false,
        message: "Academic year must be between 1 and 4",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

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

// Login using email and password
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

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

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: user
          ? "This account uses Google sign-in. Please continue with Google."
          : "Invalid email or password",
      });
    }

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

    const token = createAuthToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Login or register using Google Identity Services
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential, college, department, academicYear } = req.body;

    if (typeof credential !== "string" || !credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId || !process.env.JWT_SECRET) {
      console.error(
        "GOOGLE_CLIENT_ID or JWT_SECRET is missing from environment variables"
      );

      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Verify the credential with Google on the backend.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (
      !payload?.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified",
      });
    }

    const email = payload.email.trim().toLowerCase();

    // First look for an account already linked to this Google identity.
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      // If this verified email already belongs to a user, link the
      // Google identity to that account rather than creating a duplicate.
      user = await User.findOne({ email });

      if (user) {
        if (user.googleId && user.googleId !== payload.sub) {
          return res.status(409).json({
            success: false,
            message:
              "This email is linked to a different Google account",
          });
        }

        user.googleId = payload.sub;
        await user.save();
      } else {
        // New Google users must provide their student profile details.
        const normalizedCollege =
          typeof college === "string" ? college.trim() : "";
        const normalizedDepartment =
          typeof department === "string" ? department.trim() : "";
        const year = Number(academicYear);

        if (
          !normalizedCollege ||
          !normalizedDepartment ||
          !Number.isInteger(year) ||
          year < 1 ||
          year > 4
        ) {
          return res.status(200).json({
            success: false,
            needsProfile: true,
            message:
              "Complete your student details to create your account",
            googleUser: {
              name: payload.name || email.split("@")[0],
              email,
            },
          });
        }

        user = await User.create({
          name: payload.name || email.split("@")[0],
          email,
          googleId: payload.sub,
          role: "student",
          college: normalizedCollege,
          department: normalizedDepartment,
          academicYear: year,
        });
      }
    }

    const token = createAuthToken(user);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};
