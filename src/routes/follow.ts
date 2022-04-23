import express, { NextFunction, Request, Response } from "express";
import jwt from "../lib/jwt";
import validTokenMiddleware from "../lib/validTokenMiddleware";
import { UserModel } from "../Model/RootModel";

const followRouter = express.Router();

followRouter.patch(
  `/following`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const {
      user_id,
      following_user_id,
    }: { user_id: string; following_user_id: string } = req.body;

    if (user_id === following_user_id)
      return res
        .status(403)
        .send({ status: 403, message: "잘못된 접근입니다." });

    try {
      const findFollowingUser = await UserModel.findOne({
        _id: following_user_id,
      });
      if (!findFollowingUser)
        return res.status(404).send({
          status: 404,
          message: "The user has been deleted or does not exist.",
        });

      // 나중에 두 쿼리를 합칠 필요가있음.

      const findUserFollow = await UserModel.findOne({ _id: user_id })
        .where("follow")
        .in([following_user_id]);

      if (findUserFollow !== null) {
        return res
          .status(400)
          .send({ status: 400, message: "This user has been follow!" });
      }

      await UserModel.updateOne(
        { _id: user_id },
        { $push: { follow: following_user_id } }
      );

      //프론트는 status 가 200일때 팔로우 되었음으로 인식하게 하도록.
      res.status(200).send({
        status: 200,
        message: "success follow",
      });
    } catch (err) {
      return res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

followRouter.patch(
  `/unfollowing`,
  validTokenMiddleware,
  async (req: Request, res, next) => {
    const {
      user_id,
      following_user_id,
    }: { user_id: string; following_user_id: string } = req.body;

    if (user_id === following_user_id)
      return res
        .status(403)
        .send({ status: 403, message: "잘못된 접근입니다." });

    try {
      const findUserFollow = await UserModel.findOne({ _id: user_id })
        .where("follow")
        .in([following_user_id]);

      if (findUserFollow === null) {
        return res
          .status(404)
          .send({ status: 404, message: "Can not see follow user!" });
      }

      await UserModel.updateOne(
        { _id: user_id },
        { $pull: { follow: following_user_id } }
      );

      return res.status(200).send({ status: 200, message: "unfollow success" });
    } catch (err) {
      return res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

export default followRouter;
