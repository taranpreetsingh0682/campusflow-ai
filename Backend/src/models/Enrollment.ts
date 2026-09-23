import mongoose , {Document ,Schema } from "mongoose";

export interface IEnrollment extends Document{
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  semester:number;
  academicYear:string;
}
const enrollmentSchema = new Schema<IEnrollment>(
  {
 student:{
  type: Schema.Types.ObjectId,
  ref:"Student",
  required:true,

 },

 subject:{
  type: Schema.Types.ObjectId,
  ref:"Subject",
  required:true,

 },
 faculty:{
  type:Schema.Types.ObjectId,
  ref:"Faculty",
  required:true,
 },

 semester:{
  type:Number,
  required:true,
  min:1,
  max:8,
 },
 academicYear:{
  type:String,
  required:true,
  trim:true,
 },
  },
  {
    timestamps:true,
  }
);
enrollmentSchema.index(
  {
    student: 1,subject: 1, acadmicYear: 1
  },
  {unique:true}
);

export default mongoose.model<IEnrollment>(
  "Enrollment",
  enrollmentSchema
);