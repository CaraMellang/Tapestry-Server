import Mongoose from "mongoose";

export default function groupMemberModel() {
  const groupMemberSchema = new Mongoose.Schema({
    group_id: {
      type: Mongoose.Types.ObjectId,
      required: true,
      ref: "Group",
    },
    group_owner: { type: Mongoose.Types.ObjectId, required: true, ref: "User" },
    group_admin:{type:[Mongoose.Types.ObjectId],ref:"User"},
    group_member_count: { type: Number, default: 1 },
    group_members: {
      type: [Mongoose.Types.ObjectId],
      default: [],
      ref: "User",
    },
  });

  return Mongoose.model("GroupMember", groupMemberSchema);
}
