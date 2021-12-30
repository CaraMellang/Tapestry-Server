import Mongoose from "mongoose";

export default function groupModel() {
  const groupSchema = new Mongoose.Schema({
    owner_id: {
      type: String,
      required: true,
      ref: "User",
    },
    group_name: { type: String, default: "" },
    group_img: { type: String, default: "" },
    group_people_count: { type: Number, default: 0 },
    created_at: { type: Date, default: null },
    updated_at: { type: Date, default: null },
  });

  return Mongoose.model("GroupComment", groupSchema);
}
