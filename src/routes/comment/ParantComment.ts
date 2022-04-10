import express, { Request } from "express";
import jwt from "../../lib/jwt";
import validTokenMiddleware from "../../lib/validTokenMiddleware";
import {
  ParantCommentModel,
  PostModel,
  UserModel,
} from "../../Model/RootModel";

const ParantCommentRouter = express.Router();

ParantCommentRouter.post(`/read`, async (req: Request, res, next) => {
  const {
    body: { post_id },
  }: {
    body: { post_id: string };
  } = req;
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

    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
    const curr = new Date(utc);

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
        .status(200)
        .send({ status: 200, message: "success parantComment save" });
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

ParantCommentRouter.delete(
  `/delete`,
  validTokenMiddleware,
  async (req: Request, res, next) => {
    const {
      body: { comment_id, user_id },
    }: {
      body: { comment_id: string; user_id: string };
    } = req;
    // const authToken = req.headers[`authorization`];
    // if (!authToken) {
    //   return res.status(401).send({ status: 401, message: "Unauthorized Token" });
    // }
    // const token = authToken.split(` `)[1];
    // const verifyToken = jwt.verify(token);

    // if (verifyToken.status) {
    try {
      const findComment = await ParantCommentModel.findOne({ _id: comment_id });
      if (!findComment)
        return res
          .status(404)
          .send({ status: 404, message: "comment not found" });
      await ParantCommentModel.deleteOne({ _id: comment_id });

      return res
        .status(200)
        .send({ status: 200, message: "success delete comment" });
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
    // } else {
    //   return res.status(401).send({
    //     status: 401,
    //     message: "Unauthorized Token",
    //     err: verifyToken.err,
    //   });
    // }
  }
);

ParantCommentRouter.patch(`/update`, async (req: Request, res, next) => {});
export default ParantCommentRouter;
