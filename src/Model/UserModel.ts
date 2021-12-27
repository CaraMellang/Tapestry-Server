import Mongoose from "mongoose";
import { userSchema } from "../Schema/userSchema";

function userModel() {
  // childCommentSchema.pre()
  return Mongoose.model("User", userSchema);
}

export default userModel;
