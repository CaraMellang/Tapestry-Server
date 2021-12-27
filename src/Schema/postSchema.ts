import Mongoose from "mongoose";

export const postSchema = new Mongoose.Schema({
  group_id: {
    type: String,
    required: true,
    ref:"Group"
  },
  owner_id: {
    type: String,
    required: true,
    ref:"User"
  },
  is_private: { type: Boolean, default: false },
  images: { type: Array, default: [] },
  like_count: { type: Number, default: 0 },
  created_at: { type: Date, default: null },
  updated_at: { type: Date, default: null },
});
