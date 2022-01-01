import Mongoose from "mongoose";

export default function childCommentModel() {
  const childCommentSchema = new Mongoose.Schema({
    post_id: {
      type: String,
      required: true,
      ref: "Post",
    },
    parant_comment_id: {
      type: String,
      required: true,
      ref: "ParantComment",
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

  return Mongoose.model("ChildComment", childCommentSchema);
}
