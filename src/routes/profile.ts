import express, { NextFunction, Request, Response } from "express";
import jwt from "../lib/jwt";
import { s3, uploadProfile } from "../lib/multer";
import validTokenMiddleware from "../lib/validTokenMiddleware";
import { PostModel, UserModel } from "../Model/RootModel";

const profileRouter = express.Router();

profileRouter.post("/test", (req: Request, res: Response, next) => {
  const dddd = req.headers;
  if (!dddd["cookie"]) return res.status(404).send({ msg: "실패라는데?" });
  console.log("너니?", dddd["cookie"].split("=")[1]);
});

profileRouter.patch(
  `/setname`,
  validTokenMiddleware,
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
profileRouter.patch(
  `/setimage`,
  validTokenMiddleware,
  uploadProfile.single("profile_img"),
  async (req: Request, res, next) => {
    let imageFile: any = req.file;
    try {
      const findUser = await UserModel.findOne({
        email: res.locals.user.email,
      });
      const { user_img }: { user_img: string } = findUser;
      if (user_img) {
        await s3
          .deleteObject({
            Bucket: "tapestry-image-bucket",
            Key: `tapestry/profile/${decodeURIComponent(
              user_img.split("tapestry/profile/")[1]
            )}`,
          })
          .promise();
      }
      await UserModel.updateOne(
        { email: res.locals.user.email },
        { user_img: imageFile.location }
      );
      return res.status(201).send({ status: 201, message: "업데이트 성공" });
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

profileRouter.get(
  `/`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const user_id = req.query.user_id as unknown as string;
    const page = req.query.page as unknown as number;
    try {
      const findPosts = await PostModel.find({ owner_id: user_id })
        .populate([
          "group_id",
          { path: "owner_id", select: ["user_name", "email", "user_img"] },
        ])
        .populate({
          path: "comment",
          populate: [
            {
              path: "owner_id",
              select: ["user_name", "email", "user_img"],
            },
            {
              path: "child_comment",
              populate: {
                path: "owner_id",
                select: ["user_name", "email", "user_img"],
              },
            },
          ],
        })
        .sort({ created_at: -1 }) //내림차순 정렬
        .skip((page - 1) * 10) //건너뛸 문서
        .limit(10); //가져울 문서 제한
      if (!findPosts)
        return res.status(404).send({ status: 404, page_end: true });

      return res.status(200).send({ status: 200, data: findPosts });
    } catch (err) {
      return res.status(500).send({ status: 500, message: "Failed", err });
    }
  }
);

export default profileRouter;
