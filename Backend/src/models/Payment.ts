import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  student: mongoose.Types.ObjectId;
  studentFee: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: "online" | "cash" | "upi" | "card";
  transactionId?: string;
  paymentDate: Date;
  status: "pending" | "success" | "failed";
}

const paymentSchema = new Schema<IPayment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    studentFee: {
      type: Schema.Types.ObjectId,
      ref: "StudentFee",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["online", "cash", "upi", "card"],
      required: true,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index(
  { transactionId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model<IPayment>("Payment", paymentSchema);