import express, { Request } from "express";
import jwt from "../lib/jwt";
import { ParantCommentModel, PostModel, UserModel } from "../Model/RootModel";
import ChildCommentRouter from "./comment/ChildComment";
import ParantCommentRouter from "./comment/ParantComment";

const commentRouter = express.Router();

commentRouter.use(`/parant`, ParantCommentRouter);
commentRouter.use(`/child`, ChildCommentRouter);

// commentRouter.post(`/read`, async (req: Request, res, next) => {
//   const {
//     body: { post_id },
//   }: {
//     body: { post_id: string };
//   } = req;
// });

// commentRouter.post(`/create`, async (req: Request, res, next) => {
//   const {
//     body: { post_id, user_id, text },
//   }: {
//     body: { post_id: string; user_id: string; text: string };
//   } = req;
//   const authToken = req.headers[`authorization`];
//   if (!authToken) {
//     return res.status(401).send({ status: 401, message: "Unauthorized Token" });
//   }
//   const token = authToken.split(` `)[1];
//   const verifyToken = jwt.verify(token);

//   const date = new Date();
//   const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
//   const curr = new Date(utc);

//   if (verifyToken.status) {
//     try {
//       const findPost = await PostModel.findOne({ _id: post_id });
//       if (!findPost)
//         return res.status(404).send({ status: 404, message: "post not found" });

//       const ParantComment = new ParantCommentModel({
//         post_id,
//         owner_id: user_id,
//         text,
//         created_at: curr,
//       });
//       await ParantComment.Save();
//       return res
//         .status(200)
//         .send({ status: 200, message: "success parantComment save" });
//     } catch (err) {
//       res.status(500).send({ status: 500, message: "Failed", err });
//       next(err);
//     }
//   } else {
//     return res.status(401).send({
//       status: 401,
//       message: "Unauthorized Token",
//       err: verifyToken.err,
//     });
//   }
// });

// commentRouter.delete(`/delete`, async (req: Request, res, next) => {
//   const {
//     body: { comment_id, user_id },
//   }: {
//     body: { comment_id: string; user_id: string };
//   } = req;
//   const authToken = req.headers[`authorization`];
//   if (!authToken) {
//     return res.status(401).send({ status: 401, message: "Unauthorized Token" });
//   }
//   const token = authToken.split(` `)[1];
//   const verifyToken = jwt.verify(token);

//   if (verifyToken.status) {
//     try {
//       const findComment = await ParantCommentModel.findOne({ _id: comment_id });
//       if (!findComment)
//         return res
//           .status(404)
//           .send({ status: 404, message: "comment not found" });
//       await ParantCommentModel.deleteOne({ _id: comment_id });

//       return res
//         .status(200)
//         .send({ status: 200, message: "success delete comment" });
//     } catch (err) {
//       res.status(500).send({ status: 500, message: "Failed", err });
//       next(err);
//     }
//   } else {
//     return res.status(401).send({
//       status: 401,
//       message: "Unauthorized Token",
//       err: verifyToken.err,
//     });
//   }
// });

// commentRouter.patch(`/update`, async (req: Request, res, next) => {})
export default commentRouter;
