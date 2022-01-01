import express from "express";
import { UserModel } from "../Model/RootModel";
import bcrypt from "bcrypt";
import jwt from "../lib/jwt";

// const userModel = RootModel.userModel();

const authRouter = express.Router();

authRouter.post(`/signup`, async (req, res, next) => {
  const {
    body: { email, password, username },
  } = req;

  const date = new Date();
  const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
  const curr = new Date(utc);

  const User = new UserModel({
    email,
    password,
    username,
    created_at: curr,
  });
  try {
    let findUser = await UserModel.findOne({ email }).exec();
    if (findUser !== null) {
      res.status(400).send({ status: 400, message: "invailed email!" });
      throw Error("이미있습니다!");
    }
    await User.save();
    console.log("성공?");
    res.status(200).send({ status: 200, message: `signup Success` });
  } catch (err) {
    res.status(500).send({ status: 500, message: "Failed", err });
    next(err);
  }
});

authRouter.post(`/signin`, async (req, res, next) => {
  const {
    body: { email, password, username },
  }: { body: { email: string; password: string; username: string } } = req;
  try {
    let findUser = await UserModel.findOne({ email }).exec();
    if (findUser === null) {
      return res.status(404).send({ status: 404, message: "email not found" });
    } else {
      const comparedPassword = await bcrypt.compare(
        password.toString(),
        findUser.password
      );
      if (!comparedPassword) {
        return res
          .status(401)
          .send({ status: 401, message: "Passwords do not match." });
      }
      const accessToken = jwt.sign({ username, email });
      return res.status(200).send({
        status: 200,
        message: "signin Success",
        data: { accessToken },
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

authRouter.post("/verify", async (req: any, res, next) => {
  const splitArray = req.headers.authorization.split(` `);
  const token = splitArray[1];
  const verifyToken = jwt.verify(token);
  if (verifyToken.status) {
    return res.status(200).send({
      status: 200,
      message: "verify token Success",
      data: verifyToken.decoded,
    });
  } else {
    return res.status(401).send({
      status: 401,
      message: "Unauthorized Token",
      err: verifyToken.err,
    });
  }
});

export default authRouter;
