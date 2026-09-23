import mongoose, {Document ,Schema } from "mongoose";

export interface IAttendance extends Document{
  student:mongoose.Types.ObjectId;
  subject:mongoose.Types.ObjectId;
  faculty:mongoose.Types.ObjectId;
  date:Date;
  status: "present" | "absent";

}
const attendanceSchema = new Schema<IAttendance>(
  {
    student:{
      type:Schema.Types.ObjectId,
      ref:"Student",
      required:true,
    },
    subject:{
      type:Schema.Types.ObjectId,
      ref:"subject",
      required:true,
    },
    faculty:{
      type:Schema.Types.ObjectId,
      ref:"faculty",
      required:true,
    },
    date:{
      type:Date,
      required:true,
    },
    status:{
      type:String,
      enum:["present","absent"],
      required:true,
    },
  },
  {
    timestamps:true,
  }
);
attendanceSchema.index(
  {student: 1, subject: 1, date: 1},
  {unique:true}
);
export default mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);