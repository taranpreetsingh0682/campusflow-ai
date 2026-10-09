import mongoose, { Document, Schema } from "mongoose";

export type NotificationType =
  | "announcement"
  | "roll_number"
  | "event"
  | "fee"
  | "attendance"
  | "general";

export type NotificationAudience =
  | "all"
  | "department"
  | "role"
  | "student";

export interface INotification extends Document {
  title: string;
  message: string;
  type: NotificationType;
  audience: NotificationAudience;
  department?: mongoose.Types.ObjectId;
  role?: string;
  student?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
  expiresAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ["announcement", "roll_number", "event", "fee", "attendance", "general"],
      required: true,
      default: "general",
    },
    audience: {
      type: String,
      enum: ["all", "department", "role", "student"],
      required: true,
      default: "all",
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    role: {
      type: String,
      enum: ["student", "faculty", "hod", "accounts", "admin"],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ audience: 1, department: 1, role: 1, student: 1 });

export default mongoose.model<INotification>("Notification", notificationSchema);