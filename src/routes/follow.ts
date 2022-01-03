import express, { NextFunction, Request, Response } from "express";
import jwt from "../lib/jwt";
import { UserModel } from "../Model/RootModel";

const followRouter = express.Router();

followRouter.post(
  `/follwing`,
  async (req: Request, res, next: NextFunction) => {
    const {
      body: { user_id, following_user_id },
    }: {
      body: { user_id: string; following_user_id: string };
    } = req;
    const authToken = req.headers[`authorization`];
    if (!authToken) {
      return res
        .status(401)
        .send({ status: 401, message: "Unauthorized Token" });
    }
    const token = authToken.split(` `)[1];
    const verifyToken = jwt.verify(token);
    console.log(authToken);
    console.log(token);
    console.log(verifyToken);
    // const splitArray = req.headers.authorization.split(` `);
    // const token = splitArray[1];
    if (verifyToken.status) {
      try {
        const findUser = await UserModel.findOne({
          _id: following_user_id,
        }).catch((err) => {
          return res.status(404).send({
            status: 404,
            message: "The user has been deleted or does not exist.",
          });
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

        await UserModel.findOneAndUpdate(
          { _id: user_id },
          { $push: { follow: following_user_id } }
        );

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
  }
);

followRouter.post(`/unfollwing`, async (req: Request, res, next) => {
  const {
    body: { user_id, following_user_id },
  }: {
    body: { user_id: string; following_user_id: string };
  } = req;
  const authToken = req.headers[`authorization`];
  if (!authToken) {
    return res.status(401).send({ status: 401, message: "Unauthorized Token" });
  }
  const token = authToken.split(` `)[1];
  const verifyToken = jwt.verify(token);

  if (verifyToken.status) {
    try {
      const findUserFollow = await UserModel.findOne({ _id: user_id })
        .where("follow")
        .in([following_user_id]);

      if (findUserFollow === null) {
        return res
          .status(404)
          .send({ status: 404, message: "Can not see follow user!" });
      }

      const dd = await UserModel.updateOne(
        { _id: user_id },
        { $pull: { follow: following_user_id } }
      );
      console.log(dd);

      return res.status(200).send({ status: 200, message: "unfollow success" });
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

export default followRouter;
