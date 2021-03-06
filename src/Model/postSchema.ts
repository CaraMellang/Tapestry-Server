import Mongoose from "mongoose";

export default function postModel() {
  const postSchema = new Mongoose.Schema({
    group_id: {
      type: Mongoose.Types.ObjectId,
      required: true,
      ref: "Group",
    },
    owner_id: {
      type: Mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    is_private: { type: Boolean, default: false },
    text: { type: String, default: "" },
    comment: { type: [Mongoose.Types.ObjectId], default: [], ref: "ParantComment" },
    images: { type: Array, default: [] },
    views: { type: Number, default: 0 },
    like_count: { type: Number, default: 0 },
    like_user: { type: [Mongoose.Types.ObjectId], default: [] ,ref:"User"},
    created_at: { type: Date, default: null },
    updated_at: { type: Date, default: null },
  });

  return Mongoose.model("Post", postSchema);
}
