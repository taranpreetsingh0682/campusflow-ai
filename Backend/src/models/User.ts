
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: "admin" | "developer" | "student" | "faculty" | "accounts" | "hod";
  college?: string;
  department?: string;
  academicYear?: number;
  rollNumber?: string;

  // Password recovery fields
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordResetAttempts?: number;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      select: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["admin", "developer", "student", "faculty", "accounts", "hod"],
      default: "student",
    },
    college: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: Number,
      min: 1,
      max: 4,
    },
    rollNumber: {
      type: String,
      trim: true,
    },

    // Password recovery
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
