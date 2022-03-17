import express, { NextFunction, Request, Response } from "express";
import jwt from "../lib/jwt";
import { UserModel } from "../Model/RootModel";

const profileRouter = express.Router();

profileRouter.patch(
  `/setname`,
  (req: Request, res, next) => {
    const authToken = req.headers[`authorization`];
    if (!authToken) {
      return res
        .status(401)
        .send({ status: 401, message: "Unauthorized Token" });
    }
    const token = authToken.split(` `)[1];
    const verifyToken: any = jwt.verify(token);
    if (verifyToken.status) {
      res.locals.user = {
        email: verifyToken.decoded.email,
        user_name: verifyToken.decoded.user_name,
      };
      next();
    } else {
      return res.status(401).send({
        status: 401,
        message: "Unauthorized Token",
        err: verifyToken.err,
      });
    }
  },
  async (req: Request, res, next) => {
    const { update_user_name }: { update_user_name: string } = req.body;
    if (update_user_name === "" || !update_user_name) {
      return res
        .status(500)
        .send({ status: 500, message: "입력값이 없습니다!" });
    }
    try {
      const isUser = await UserModel.findOne({ email: res.locals.user.email });
      if (!isUser)
        return res
          .status(404)
          .send({ status: 404, message: "사용자를 찾을수 없습니다." });

      const updateUser = await UserModel.updateOne(
        { email: res.locals.user.email },
        { user_name: update_user_name }
      );
      return res
        .status(200)
        .send({ status: 200, message: "업데이트 완료", updateUser });
    } catch (err) {
      res
        .status(500)
        .send({ status: 500, message: "에러가 발생했습니다.", err });
    }
  }
);

export default profileRouter;
