import Mongoose from "mongoose";
import { childCommentSchema } from "../Schema/childCommentSchema";

function childCommentModel() {
  // childCommentSchema.pre()
  return Mongoose.model("ChildComment", childCommentSchema);
}

export default childCommentModel;
