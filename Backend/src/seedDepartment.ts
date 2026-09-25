import mongoose from "mongoose";
import dotenv from "dotenv";
import Department from "./models/Department";


dotenv.config();

const departments=[
  {
    name:"Artificial Intelligence and machine learning",
    code:"AIML",
    description:"Department of Artificial Intelligence and machine learning",
  },

  {
    name:"Computer Science and engineering",
    code:"CSE",
    description:"Department of Computer Science and engineering ",
  },
  {
    name:"Mechanical Engineering",
    code:"ME",
    description:"Department of Mechanical engineering",

  },
  {
    name:"Electrical engineering",
    code:"EE",
    description:"Department of electrical engineering",
  },
  {
    name:"Automation Engineering",
    code:"AUTO",
    description:"Department of automation engineering",

  },
  {
    name:"Bachelor of Business Administrator",
    code:"BBA",
    description:"Department of Business Administrator",
  },
];
const seedDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("MongoDB connected");

    await Department.deleteMany({});

    const createdDepartments = await Department.insertMany(departments);

    console.log("\nDepartments created successfully:\n");

    createdDepartments.forEach((department) => {
      console.log(
        `${department.code} → ${department._id} → ${department.name}`
      );
    });

    await mongoose.connection.close();

    console.log("\nMongoDB connection closed");
  } catch (error) {
    console.error("Error seeding departments:", error);
    process.exit(1);
  }
};

seedDepartments();

