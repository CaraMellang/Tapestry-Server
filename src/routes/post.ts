import express from "express";
import jwt from "../lib/jwt";
import { GroupModel, PostModel, UserModel } from "../Model/RootModel";

const postRouter = express.Router();

postRouter.post(`/create`, async (req: any, res, next) => {
  const {
    body: { group_id, email, is_private, text, images },
  }: {
    body: {
      group_id: string;
      email: string;
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

  if (verifyToken.status) {
    try {
      const isExistGroup = await GroupModel.findOne({ _id: group_id }).exec();
      if (!isExistGroup) {
        return res
          .status(404)
          .send({ status: 404, message: "group is not found!" });
      }
      const writer = await UserModel.findOne({ email }).exec();
      const Post = new PostModel({
        group_id,
        owner_id: writer._id,
        is_private,
        text,
        images,
        created_at: curr,
      });
      await Post.save();
      return res
        .status(200)
        .send({ status: 200, message: "create post successed" });
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

postRouter.post(`/read`, async (req: any, res, next) => {
  const {
    body: { group_id },
  }: {
    body: {
      group_id: string;
    };
  } = req;
  try {
    const isExistGroup = await GroupModel.findOne({ group_id }).exec();
    if (!isExistGroup)
      return res
        .status(404)
        .send({ status: 404, message: "group is not found" });
    const Posts = await PostModel.find({ group_id })
      .sort({ created_at: -1 }) //내림차순 정렬
      .skip(0) //건너뛸 문서
      .limit(10) //가져울 문서 제한
      .exec();
    console.log(Posts);
    res.status(200).send({ status: 200, message: "success read", data: Posts });
  } catch (err) {
    res.status(500).send({ status: 500, message: "Failed", err });
    next(err);
  }
});

export default postRouter;
