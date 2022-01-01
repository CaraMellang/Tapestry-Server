import express from "express";
import jwt from "../lib/jwt";
import { GroupModel, PostModel } from "../Model/RootModel";

const postRouter = express.Router();

postRouter.post("/create", async (req: any, res, next) => {
  const {
    body: { group_id, owner_id, is_private, text, images },
  }: {
    body: {
      group_id: string;
      owner_id: string;
      is_private: boolean;
      text: string;
      images: string[];
    };
  } = req;
  const splitArray = req.headers.authorization.split(` `);
  const token = splitArray[1];
  const verifyToken = jwt.verify(token);

  const date = new Date();
  const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
  const curr = new Date(utc);

  const Post = new PostModel({
    group_id,
    owner_id,
    is_private,
    text,
    images,
    created_at: curr,
  });

  if (verifyToken.status) {
    try {
      const isExistGroup = await GroupModel.findOne({ _id: group_id }).exec();
      if (!isExistGroup) {
        return res
          .status(404)
          .send({ status: 404, message: "group is not found!" });
      }
      await Post.save();
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  } else {
    return res.status(401).send({
      status: 401,
      message: "Unauthorized Token",
      err: verifyToken.err,
    });
  }
});

export default postRouter;
