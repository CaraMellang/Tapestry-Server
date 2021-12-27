import Mongoose from "mongoose";
import { postSchema } from "../Schema/postSchema";

function postModel() {
  // childCommentSchema.pre()
  return Mongoose.model("Post", postSchema);
}

export default postModel;
