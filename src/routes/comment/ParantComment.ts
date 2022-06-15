import express, { Request, Response } from "express";
import jwt from "../../lib/jwt";
import validTokenMiddleware from "../../lib/validTokenMiddleware";
import {
  ChildCommentModel,
  ParantCommentModel,
  PostModel,
  UserModel,
} from "../../Model/RootModel";

const ParantCommentRouter = express.Router();

ParantCommentRouter.post(`/read`, async (req: Request, res, next) => {
  const { post_id }: { post_id: string } = req.body;
  try {
    const findPost = await PostModel.findOne({ _id: post_id });
    if (!findPost)
      return res
        .status(404)
        .send({ status: 404, message: "게시글이 존재하지않음." });

    const findPostComment = await ParantCommentModel.find({ post_id }).populate(
      [
        { path: "owner_id", select: ["_id", "email", "user_name", "user_img"] },
        {
          path: "child_comment",
          populate: {
            path: "owner_id",
            select: ["_id", "email", "user_name", "user_img"],
          },
        },
      ]
    );

    return res
      .status(201)
      .send({ status: 201, message: "성공", data: findPostComment });
  } catch (err) {
    res.status(500).send({ status: 500, message: "Failed", err });
    next(err);
  }
});

ParantCommentRouter.post(
  `/create`,
  validTokenMiddleware,
  async (req: Request, res, next) => {
    const {
      body: { post_id, user_id, text },
    }: {
      body: { post_id: string; user_id: string; text: string };
    } = req;

    let curr: Date;
    if (process.env.NODE_ENV === "development") {
      curr = new Date();
    } else {
      const date = new Date();
      const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
      curr = new Date(utc);
    }

    try {
      const findPost = await PostModel.findOne({ _id: post_id });
      if (!findPost)
        return res.status(404).send({ status: 404, message: "post not found" });

      const ParantComment = new ParantCommentModel({
        post_id,
        owner_id: user_id,
        text,
        created_at: curr,
      });
      await ParantComment.save();
      await PostModel.findOneAndUpdate(
        { _id: post_id },
        { $push: { comment: ParantComment._id } }
      );
      return res
        .status(201)
        .send({ status: 201, message: "success parantComment save" });
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

ParantCommentRouter.delete(
  `/delete`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const { comment_id, user_id }: { comment_id: string; user_id: string } =
      req.body;
    try {
      const findParantComment = await ParantCommentModel.findOne({
        _id: comment_id,
      });
      if (!findParantComment)
        return res
          .status(404)
          .send({ status: 404, message: "comment not found" });

      if (user_id !== findParantComment.owner_id.toString()) {
        return res
          .status(403)
          .send({ status: 403, message: "권한이 없습니다." });
      }
      await ParantCommentModel.deleteOne({ _id: comment_id });
      await ChildCommentModel.deleteMany({ parant_comment_id: comment_id });

      return res
        .status(200)
        .send({ status: 200, message: "success delete comment" });
    } catch (err) {
      return res.status(500).send({ status: 500, message: "Failed", err });
    }
  }
);

ParantCommentRouter.patch(`/update`, async (req: Request, res, next) => {});
export default ParantCommentRouter;
