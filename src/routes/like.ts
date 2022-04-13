import express, { NextFunction, Request, Response } from "express";
import jwt from "../lib/jwt";
import validTokenMiddleware from "../lib/validTokenMiddleware";
import {
  GroupModel,
  ParantCommentModel,
  PostModel,
  UserModel,
} from "../Model/RootModel";

const likeRouter = express.Router();

likeRouter.patch(
  "/like",
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const { post_id }: { post_id: string } = req.body;
    try {
      const findPost = await PostModel.findOne({ _id: post_id });
      if (!findPost)
        return res
          .status(404)
          .send({ status: 404, message: "존재하지 않는 게시글입니다." });
      const findUser = await UserModel.findOne({
        email: res.locals.user.email,
      });
      if (!findUser)
        return res
          .status(404)
          .send({ status: 404, message: "존재하지 않는 유저입니다." });
      await PostModel.updateOne(
        { _id: post_id },
        {
          like_count: findPost.like_count + 1,
          $push: { like_user: findUser._id },
        }
      );
      return res.status(201).send({ status: 201, message: "좋아요 완료" });
    } catch (err) {
      return res.status(500).send({ status: 500, message: "Failed", err });
    }
  }
);
likeRouter.patch(
  "/dislike",
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const { post_id }: { post_id: string } = req.body;
    try {
      const findPost = await PostModel.findOne({ _id: post_id });
      if (!findPost)
        return res
          .status(404)
          .send({ status: 404, message: "존재하지 않는 게시글입니다." });
      const findUser = await UserModel.findOne({
        email: res.locals.user.email,
      });
      if (!findUser)
        return res
          .status(404)
          .send({ status: 404, message: "존재하지 않는 유저입니다." });

      await PostModel.updateOne(
        { _id: post_id },
        {
          like_count: findPost.like_count - 1,
          $pull: { like_user: findUser._id },
        }
      );
      return res.status(201).send({ status: 201, message: "좋아요 취소 완료" });
    } catch (err) {
      return res.status(500).send({ status: 500, message: "Failed", err });
    }
  }
);

export default likeRouter;
