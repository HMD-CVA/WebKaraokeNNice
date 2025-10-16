import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://huynhmyduc2005_db_user:5oLJA7f9uK9WQXXT@cluster0.c2otaab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

export default {connectDB};