import Mongoose from "mongoose";

export default function parantCommentModel() {
   const parantCommentSchema = new Mongoose.Schema({
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
    child_comment: { type: Array, default: [], ref: "ChildComment" },
    like_count: { type: Number, default: 0 },
    created_at: { type: Date, default: null },
    updated_at: { type: Date, default: null },
  });

  return Mongoose.model("ParantComment", parantCommentSchema);
}
