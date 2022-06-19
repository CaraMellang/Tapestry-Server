import Mongoose from "mongoose";

export default function groupMemberModel() {
  const groupMemberSchema = new Mongoose.Schema({
    group_id: {
      type: Mongoose.Types.ObjectId,
      required: true,
      ref: "Group",
    },
    group_memver_count: { type: Number, default: 1 },
    group_members: {
      type: [Mongoose.Types.ObjectId],
      default: [],
      ref: "User",
    },
  });

  return Mongoose.model("GroupMember", groupMemberSchema);
}
