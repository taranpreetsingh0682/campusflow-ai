import mongoose,{ Document ,Schema} from "mongoose";

export interface IFeeStructure extends Document{
  department:mongoose.Types.ObjectId;
  semester:number;
  academicYear:string;
  tuitionFee:number;
  examFee:number;
  libraryFee:number;
  otherFee:number;
  totalFee:number;
}
const feeStructureSchema = new Schema<IFeeStructure>(
  {
    department:{
      type:Schema.Types.ObjectId,
      ref:"Department",
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
    tuitionFee:{
      type:Number,
      required:true,
      min:0,
    },
    libraryFee:{
      type:Number,
      required:true,
      min:0,
    },
   otherFee:{
    type:Number,
    required:true,
    min:0,
   },
   totalFee:{
    type:Number,
    required:true,
    min:0,
   },

  },
  {
    timestamps:true,
  }
);
feeStructureSchema.index(
  {department:1,semester:1,academicYear:1},
  {unique:true}

);
export default mongoose.model<IFeeStructure>(
  "FeeStructure",
  feeStructureSchema
);  