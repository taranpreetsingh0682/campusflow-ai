import mongoose, { Document, Schema } from "mongoose";

export type ComplaintCategory =
  | "academic"
  | "attendance"
  | "fees"
  | "faculty"
  | "infrastructure"
  | "harassment"
  | "other";

export type ComplaintStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected";

export interface IComplaint extends Document {
  student: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: "low" | "medium" | "high" | "urgent";
  status: ComplaintStatus;
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  isAnonymous: boolean;
}

const complaintSchema = new Schema<IComplaint>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: [
        "academic",
        "attendance",
        "fees",
        "faculty",
        "infrastructure",
        "harassment",
        "other",
      ],
      default: "other",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
      ],
      default: "pending",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolution: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({ status: 1, priority: 1, createdAt: -1 });

export default mongoose.model<IComplaint>("Complaint", complaintSchema);