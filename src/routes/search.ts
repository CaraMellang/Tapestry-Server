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
      body: { searchString, type },
    }: { body: { searchString: string; type: string } } = req;

    try {
    } catch (err) {
      console.log(err);
      res.status(400).send({ status: 400, message: "err" });
      next(err);
    }
  }
});

export default searchRouter;
