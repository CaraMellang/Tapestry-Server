import userModel from "./userSchema";
import postModel from "./postSchema";
import parantCommentModel from "./parantCommentSchema";
import groupModel from "./groupSchema";
import childCommentModel from "./childCommentSchema";

// function RootModel(){
//   const userModel = userModel()
//   return
// }

const UserModel = userModel();
const GroupModel = groupModel();

export {
  UserModel,
  GroupModel,
  postModel,
  parantCommentModel,
  childCommentModel,
};
