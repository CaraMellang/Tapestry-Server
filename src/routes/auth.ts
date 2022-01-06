import express, { NextFunction, Request, Response } from "express";
import { UserModel } from "../Model/RootModel";
import bcrypt from "bcrypt";
import jwt from "../lib/jwt";
import passport from "passport";
// const userModel = RootModel.userModel();

const authRouter = express.Router();

authRouter.get(
  `/google`,
  passport.authenticate("google", { scope: ["email", "profile"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false, // passport 세션 비활성화
    failureRedirect: "/",
  }),
  function (req, res: any) {
    // Successful authentication, redirect home.
    console.log("callback", res.req.user.data.User);
    const aceessToken = jwt.sign(res.req.user.data.User.toJSON());
    // res.redirect('/');
    res.send({ data: aceessToken });
  }
);

// const authenticateUser = (req: Request, res: Response, next: NextFunction) => { // 세션사용시 사용한 코드
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     res.status(301).redirect("/");
//   }
// };
// authRouter.get(
//   "/googleverify",
//   authenticateUser,
//   function (req: Request, res: Response, next: NextFunction) {
//     res.status(201).send({ status: 201, message: "success verify" });
//   }
// );

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
    user_name: username,
    created_at: curr,
    provider: "local",
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
        data: { email, username, accessToken },
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

authRouter.post("/verify", async (req: Request, res, next) => {
  const authToken = req.headers[`authorization`];
  if (!authToken) {
    return res.status(401).send({ status: 401, message: "Unauthorized Token" });
  }
  const token = authToken.split(` `)[1];
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
