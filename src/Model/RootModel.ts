import userModel from "./userSchema";
import postModel from "./postSchema";
import parantCommentModel from "./parantCommentSchema";
import groupModel from "./groupSchema";
import childCommentModel from "./childCommentSchema";

// function RootModel(){
//   const userModel = userModel()
//   return
// }

//스키마에서 모델만들어서 리턴하기 떄문에 투두사이트처럼 각 파일에서 호출하면 스키마가 중복선언되기때문에 여기서 한번만 선언해주어야함

const UserModel = userModel();
const GroupModel = groupModel();
const PostModel = postModel();
const ParantCommentModel = parantCommentModel();
const ChildCommentModel = childCommentModel();

export {
  UserModel,
  GroupModel,
  PostModel,
  ParantCommentModel,
  ChildCommentModel,
};
