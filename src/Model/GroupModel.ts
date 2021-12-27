import Mongoose from "mongoose";
import { groupSchema } from "../Schema/groupSchema";

function groupModel() {
  // childCommentSchema.pre()
  return Mongoose.model("GroupComment", groupSchema);
}

export default groupModel;
