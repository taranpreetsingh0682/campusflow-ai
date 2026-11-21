
import mongoose, { Document, Schema } from "mongoose";

export interface ISemesterResult extends Document {
  student: mongoose.Types.ObjectId;
  semester: number;
  sgpa: number;
}

const semesterResultSchema = new Schema<ISemesterResult>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    sgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

semesterResultSchema.index(
  { student: 1, semester: 1 },
  { unique: true }
);

export default mongoose.model<ISemesterResult>(
  "SemesterResult",
  semesterResultSchema
);
