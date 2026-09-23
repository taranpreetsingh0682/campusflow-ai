import mongoose, { Document, Schema } from "mongoose";

export interface IStudentFee extends Document {
  student: mongoose.Types.ObjectId;
  feeStructure: mongoose.Types.ObjectId;
  scholarship?: mongoose.Types.ObjectId;
  academicYear: string;

  totalFee: number;
  scholarshipAmount: number;
  fine: number;
  payableAmount: number;
  paidAmount: number;
  pendingAmount: number;

  status: "pending" | "partial" | "paid";
  noDues: boolean;
}

const studentFeeSchema = new Schema<IStudentFee>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    feeStructure: {
      type: Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },

    scholarship: {
      type: Schema.Types.ObjectId,
      ref: "Scholarship",
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },

    scholarshipAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    fine: {
      type: Number,
      default: 0,
      min: 0,
    },

    payableAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },

    noDues: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

studentFeeSchema.index(
  { student: 1, feeStructure: 1, academicYear: 1 },
  { unique: true }
);

export default mongoose.model<IStudentFee>(
  "StudentFee",
  studentFeeSchema
);