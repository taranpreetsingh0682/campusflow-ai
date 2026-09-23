import mongoose, { Document, Schema } from "mongoose";

export interface IScholarship extends Document {
  student: mongoose.Types.ObjectId;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  academicYear: string;
  status: "pending" | "approved" | "rejected";
}

const scholarshipSchema = new Schema<IScholarship>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

scholarshipSchema.index(
  { student: 1, academicYear: 1 },
  { unique: true }
);

export default mongoose.model<IScholarship>(
  "Scholarship",
  scholarshipSchema
);