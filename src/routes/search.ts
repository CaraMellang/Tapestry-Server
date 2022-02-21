import express, { NextFunction, Request, Response } from "express";
import jwt from "../lib/jwt";
import {
  GroupModel,
  ParantCommentModel,
  PostModel,
  UserModel,
} from "../Model/RootModel";

const searchRouter = express.Router();

searchRouter.post(`/`, async (req: Request, res, next) => {
  {
    const {
      body: { search, page, type },
    }: { body: { search: string; page: number; type: string } } = req;
    console.log(type);
    console.log(page);
    console.log(search);
    try {
      if (type === "group") {
        const groupData = await GroupModel.find({
          group_name: { $regex: search },
        })
          .sort({ created_at: -1 })
          .skip((page - 1) * 10)
          .limit(10);
        return res.send({ data: groupData });
      }
      if (type === "post") {
        const postData = await PostModel.find({ text: { $regex: search } })
          .populate([
            "group_id",
            { path: "owner_id", select: ["user_name", "email", "user_img"] },
          ])
          .sort({ created_at: -1 }) //내림차순 정렬
          .skip((page - 1) * 10) //건너뛸 문서
          .limit(10); //가져울 문서 제한
        return res.send({ data: postData });
      }
      if (type === "user") {
        const userData = await UserModel.find({
          user_name: { $regex: search },
        })
          .sort({ created_at: -1 })
          .skip((page - 1) * 10)
          .limit(10);
        return res.send({ data: userData });
      }
      if (!type || type === "") {
        return res
          .status(400)
          .send({ status: 400, message: "Invailed type data!" });
      }
      return res.status(501).send({ status: 501, message: "Not implemented" });
    } catch (err) {
      console.log(err);
      res.status(400).send({ status: 400, message: "err" });
      next(err);
    }
  }
});

export default searchRouter;
