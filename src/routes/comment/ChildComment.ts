import express, { Request, Response } from "express";
import jwt from "../../lib/jwt";
import validTokenMiddleware from "../../lib/validTokenMiddleware";
import {
  ChildCommentModel,
  ParantCommentModel,
  PostModel,
  UserModel,
} from "../../Model/RootModel";

const ChildCommentRouter = express.Router();

ChildCommentRouter.get("/read", async (req: Request, res: Response, next) => {
  const { parant_comment_id }  = req.query;
  try {
    const findChild = await ChildCommentModel.find({
      parant_comment_id,
    }).populate({ path: "owner_id", select: ["_id","email","user_name","user_img"] });
    if (!findChild || findChild.length === 0)
      return res
        .status(404)
        .send({ status: 404, message: "not found childcommnet" });

    return res.status(200).send({
      status: 200,
      message: "success res childcomment",
      data: findChild,
    });
  } catch (err) {
    res.status(500).send({ status: 500, message: "Failed", err });
    next(err);
  }
});

ChildCommentRouter.post(
  `/create`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const {
      post_id,
      parant_comment_id,
      text,
    }: {
      post_id: string;
      parant_comment_id: string;
      text: string;
    } = req.body;

    let curr: Date;
    if (process.env.NODE_ENV === "development") {
      curr = new Date();
    } else {
      const date = new Date();
      const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
      curr = new Date(utc);
    }

    try {
      const findUser = await UserModel.findOne({
        email: res.locals.user.email,
      });
      if (!findUser)
        res.status(404).send({ status: 404, message: "없는 사용자입니다." });

      const findParant = await ParantCommentModel.findOne({
        _id: parant_comment_id,
      });
      if (!findParant)
        res.status(404).send({ status: 404, message: "없는 부모댓글입니다." });

      const ChildComment = new ChildCommentModel({
        post_id,
        parant_comment_id,
        owner_id: findUser._id,
        text,
        created_at: curr,
      });
      await ChildComment.save();
      await ParantCommentModel.updateOne(
        { _id: parant_comment_id },
        { $push: { child_comment: ChildComment._id } }
      );
      return res
        .status(201)
        .send({ status: 201, message: "success create childComment " });
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

export default ChildCommentRouter;
