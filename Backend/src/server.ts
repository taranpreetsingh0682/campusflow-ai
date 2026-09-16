import "dotenv/config";
import app from "./app";
import connectDB from "./config/database";

const PORT = 5000;

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 CampusFlow AI Backend running on port ${PORT}`);
  });
};

startServer();