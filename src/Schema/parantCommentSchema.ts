import Mongoose from "mongoose";

export const parantCommentSchema = new Mongoose.Schema({
  post_id: {
    type: String,
    required: true,
    ref: "Post",
  },
  owner_id: {
    type: String,
    required: true,
    ref: "User",
  },
  text: { type: String, required: true },
  like_count: { type: Number, default: 0 },
  created_at: { type: Date, default: null },
  updated_at: { type: Date, default: null },
});
