import Mongoose from "mongoose";
import { parantCommentSchema } from "../Schema/parantCommentSchema";


function parantCommentModel() {
  // childCommentSchema.pre()
  return Mongoose.model("ParantComment", parantCommentSchema);
}

export default parantCommentModel;
