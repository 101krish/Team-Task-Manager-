import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    console.log("[MongoDB] Attempting connection...");
    
    const conn = await mongoose.connect(mongoUri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true
    });

    console.log(`[MongoDB] Connected to: ${conn.connection.host}`);
    console.log(`[MongoDB] Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Error:`, error.message);
    throw error;
  }
};

export default connectDB;
