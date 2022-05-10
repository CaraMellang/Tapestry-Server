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

    return res
      .cookie("access_token", aceessToken, {
        // httpOnly: true,
        maxAge: 60 * 60 * 1000,
      })
      .redirect("http://localhost:3000");
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
    email,
    password,
    username,
    userImg,
  }: {
    email: string;
    password: string;
    username: string;
    userImg: string | null;
  } = req.body;

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
      return res.status(400).send({ status: 400, message: "invailed email!" });
    }
    await User.save();
    console.log("성공?");
    return res.status(201).send({ status: 201, message: `signup Success` });
  } catch (err) {
    return res.status(500).send({ status: 500, message: "Failed", err });
    next(err);
  }
});

authRouter.post(`/signin`, async (req, res, next) => {
  const {
    body: { email, password },
  }: { body: { email: string; password: string } } = req;
  try {
    let findUser = await UserModel.findOne({ email }).populate({
      path: "group",
      populate: {
        path: "owner_id",
        select: ["user_name", "email", "user_img"],
      },
    });
    // .populate({
    //   path: "follow",
    //   select: ["user_name", "email", "user_img"],
    // })

    let { user_name, created_at, _id, user_img, follow, group } = findUser;
    if (findUser === null) {
      return res.status(404).send({ status: 404, message: "user not found" });
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
      const accessToken = jwt.sign({
        email,
        // created_at,
        // user_img,
        // follow,
      });
      // res.cookie("access_token", accessToken, {
      //   httpOnly: true,
      //   maxAge: 60 * 60 * 1000,
      // })
      return res.status(200).send({
        status: 200,
        message: "signin Success",
        data: {
          userId: _id,
          email,
          username: user_name,
          createdAt: created_at,
          user_img,
          follow,
          group,
          accessToken,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ status: 400, message: "err" });
  }
});

authRouter.post("/verify", async (req: Request, res, next) => {
  const authToken = req.headers[`cookie`];
  console.log("안녕하세요", req.headers);
  if (!authToken) {
    return res.status(401).send({ status: 401, message: "Unauthorized Token" });
  }
  const token = authToken.split(`=`)[1];
  const verifyToken: any = jwt.verify(token);
  try {
    if (verifyToken.status) {
      let findUser = await UserModel.findOne(
        {
          email: verifyToken.decoded.email,
        },
        ["user_name", "email", "user_img", "created_at"]
      ).populate({
        path: "group",
        populate: {
          path: "owner_id",
          select: ["user_name", "email", "user_img"],
        },
      });
      // .populate({
      //   path: "follow",
      //   select: ["user_name", "email", "user_img"],
      // })

      let { email, user_name, created_at, _id, user_img, follow, group } =
        findUser;
      return res.status(201).send({
        status: 200,
        message: "verify token Success",
        data: {
          userId: _id,
          email: email,
          username: user_name,
          createdAt: created_at,
          user_img: user_img,
          follow: follow,
          group: group,
          accessToken: token,
        },
      });
    } else {
      return res.status(401).send({
        status: 401,
        message: "Unauthorized Token",
        err: verifyToken.err,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ status: 400, message: "err" });
  }
});

authRouter.post(`/test`, (req, res, net) => {
  const authToken = req.headers[`cookie`]?.split("=")[1];

  console.log("토", authToken);
  return res.send({ msg: "퉤" });
});

export default authRouter;
