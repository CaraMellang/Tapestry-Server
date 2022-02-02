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

    try {
      if (type === "group") {
        const groupData = await GroupModel.find({
          group_name: { $regex: search },
        });
        return res.send({ data: groupData });
      }
      if (type === "post") {
        const postData = await PostModel.find({ text: { $regex: search } });
        return res.send({ data: postData });
      }
      if (type === "user") {
        const userData = await UserModel.find({
          user_name: { $regex: search },
        });
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
