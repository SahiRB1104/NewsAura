// models/ReadLater.js
import mongoose from "mongoose";

const readLaterSchema = new mongoose.Schema(
  {
    userId: String,
    username: String,
    article: {
      id: String,
      title: String,
      description: String,
      imageUrl: String,
      category: String,
      pubDate: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ReadLater", readLaterSchema);
