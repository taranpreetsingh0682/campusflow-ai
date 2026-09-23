import mongoose , {Document,Schema} from "mongoose";
export interface IMarks extends Document{
  student:mongoose.Types.ObjectId;
  subject:mongoose.Types.ObjectId;
  faculty:mongoose.Types.ObjectId;
  semester:number;
  academicYear:string;
  marks:number;
  maxMarks:number;
  assessmentType: "sessional"|"assignment"|"practical"|"Internal";

}
const marksSchema = new Schema<IMarks>(
  {
    student:{
      type:Schema.Types.ObjectId,
      ref:"student",
      required:true,
    },
    subject:{
      type:Schema.Types.ObjectId,
      ref:"subject",
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
    marks:{
      type:Number,
      required:true,
      min:0,
    },
    maxMarks:{
      type:Number,
      required:true,
      min:1,
    },
    assessmentType:{
      type:String,
      enum:["sessional","assignment","practical","internal"],
      required:true,
    },
  },
  {
    timestamps:true,
  }
);
marksSchema.index(
  {
    student:1,
    subject:1,
    assessmentType:1,
    academicYear:1,

  },
  {unique:true}
);
export default mongoose.model<IMarks>("Marks",marksSchema);