"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildCommentModel = exports.ParantCommentModel = exports.PostModel = exports.GroupModel = exports.UserModel = void 0;
const userSchema_1 = __importDefault(require("./userSchema"));
const postSchema_1 = __importDefault(require("./postSchema"));
const parantCommentSchema_1 = __importDefault(require("./parantCommentSchema"));
const groupSchema_1 = __importDefault(require("./groupSchema"));
const childCommentSchema_1 = __importDefault(require("./childCommentSchema"));
// function RootModel(){
//   const userModel = userModel()
//   return
// }
//스키마에서 모델만들어서 리턴하기 떄문에 투두사이트처럼 각 파일에서 호출하면 스키마가 중복선언되기때문에 여기서 한번만 선언해주어야함
const UserModel = (0, userSchema_1.default)();
exports.UserModel = UserModel;
const GroupModel = (0, groupSchema_1.default)();
exports.GroupModel = GroupModel;
const PostModel = (0, postSchema_1.default)();
exports.PostModel = PostModel;
const ParantCommentModel = (0, parantCommentSchema_1.default)();
exports.ParantCommentModel = ParantCommentModel;
const ChildCommentModel = (0, childCommentSchema_1.default)();
exports.ChildCommentModel = ChildCommentModel;
