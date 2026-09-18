import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    const connectionInstance = await mongoose.connect(mongoUri);

    console.log(
      `✅ MongoDB Connected: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(
      "❌ MongoDB Connection Failed:",
      error instanceof Error ? error.message : error
    );

    process.exit(1);
  }
};

export default connectDB;