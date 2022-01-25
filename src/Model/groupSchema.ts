import Mongoose from "mongoose";

export default function groupModel() {
  const groupSchema = new Mongoose.Schema({
    owner_id: {
      type: Mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    group_name: { type: String, default: "" },
    group_description:{type:String, default:""},
    group_img: { type: String, default: "" },
    group_people_count: { type: Number, default: 1 },
    group_peoples:{type:[Mongoose.Types.ObjectId] , default:[] , ref:"User"},
    created_at: { type: Date, default: null },
    updated_at: { type: Date, default: null },
  });

  return Mongoose.model("Group", groupSchema);
}
