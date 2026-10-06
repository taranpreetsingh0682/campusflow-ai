import mongoose, { Document, Schema } from "mongoose";

export interface IFaculty extends Document {
  user: mongoose.Types.ObjectId;
  employeeId: string;
  departments: mongoose.Types.ObjectId[];
  subjects: mongoose.Types.ObjectId[];
}

const facultySchema = new Schema<IFaculty>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    departments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
    ],

    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFaculty>("Faculty", facultySchema);