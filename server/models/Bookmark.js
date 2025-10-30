import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    article: {
      id: String,
      title: String,
      description: String,
      imageUrl: String,
      sourceUrl: String,
      source: String,
      category: String,
      pubDate: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bookmark", BookmarkSchema);
