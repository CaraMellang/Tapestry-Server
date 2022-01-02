import express from "express";
import jwt from "../lib/jwt";
import { UserModel } from "../Model/RootModel";

const followRouter = express.Router();

followRouter.post(`/follwing`, async (req: any, res, next) => {
  const {
    body: { user_id, following_user_id },
  }: {
    body: { user_id: string; following_user_id: string };
  } = req;
  const splitArray = req.headers.authorization.split(` `);
  const token = splitArray[1];
  const verifyToken = jwt.verify(token);

  if (verifyToken.status) {
    try {
      const isExistUser = await UserModel.findOne({
        _id: following_user_id,
      }).exec();
      if (!isExistUser)
        return res.status(404).send({
          status: 404,
          message: "The user has been deleted or does not exist.",
        });

      const findUserFollow = await UserModel.findOne({ _id: user_id })
        .where("follow")
        .in([following_user_id])
        .exec();

      if (findUserFollow !== null) {
        return res
          .status(400)
          .send({ status: 400, message: "This user has been follow!" });
      }

      //먼저 find하고 update해서 값이 업데이트 전값으로 저장되어서 한번더 쿼리진행.
      await UserModel.findOneAndUpdate(
        { _id: user_id },
        { $push: { follow: following_user_id } }
      ).exec();

      //프론트는 status 가 200일때 팔로우 되었음으로 인식하게 하도록.
      res.status(200).send({
        status: 200,
        message: "success follow",
      });
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

  return;
});

followRouter.post(`/unfollwing`, async (req, res, next) => {
  return;
});

export default followRouter;
