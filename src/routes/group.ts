import express, { NextFunction, Request, Response } from "express";
import { UserModel, GroupModel } from "../Model/RootModel";
import bcrypt from "bcrypt";
import jwt from "../lib/jwt";
import { uploadImage } from "../lib/multer";
import { FileContent } from "aws-sdk/clients/codecommit";
import validTokenMiddleware from "../lib/validTokenMiddleware";
import dotenv from "dotenv";
dotenv.config();

const groupRouter = express.Router();

groupRouter.get(`/readgroupmember`, async (req: Request, res, next) => {
  const { group_id, user_id } = req.query;
  try {
    const findGroup = await GroupModel.findOne({ _id: group_id }).populate([
      {
        path: "group_peoples",
        select: ["user_name", "email", "user_img"],
      },
      { path: "owner_id", select: ["user_name", "email", "user_img"] },
    ]);
    if (!findGroup)
      return res
        .status(404)
        .send({ status: 404, message: "존재하지 않는 그룹입니다." });

    const findUser = await UserModel.findOne({ _id: user_id });

    return res.status(200).send({
      status: 200,
      data: { group: findGroup, follows: findUser.follow },
    });
  } catch (err) {
    return res.status(500).send({ status: 500, message: "Failed", err });
  }
});

groupRouter.patch(
  `/patchfollow`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const {} = req.body;
  }
);
groupRouter.patch(
  `/patchunfollow`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const {} = req.body;
  }
);

groupRouter.post(
  "/create",
  validTokenMiddleware,
  uploadImage.single("group_img"),
  async (req: Request, res, next) => {
    const {
      body: { group_name, group_description },
    }: {
      body: {
        group_name: string;
        group_description: string;
      };
    } = req;
    const { email, user_name } = res.locals.user;
    let imageFile: any = req.file;
    // imageFile = {
    //   fieldname: null,
    //   originalname:null ,
    //   encoding: null,
    //   mimetype: null,
    //   size: null,
    //   bucket: null,
    //   key: null,
    //   acl: null,
    //   contentType: null,
    //   contentDisposition: null,
    //   contentEncoding: null,
    //   storageClass: null,
    //   serverSideEncryption: null,
    //   metadata: null,
    //   location: null,
    //   etag: null,
    //   versionId: undefined
    // }

    let curr: Date;
    if (process.env.NODE_ENV === "development") {
      curr = new Date();
    } else {
      const date = new Date();
      const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
      curr = new Date(utc);
    }

    try {
      const verifyGroupName = await GroupModel.findOne({ group_name }).exec();
      if (verifyGroupName) {
        return res
          .status(400)
          .send({ status: 400, message: "invailed group name!" });
      }
      const user = await UserModel.findOne({
        email: email,
      });

      if (!user)
        return res
          .status(404)
          .send({ status: 404, message: "user not found!" });

      const Group = new GroupModel({
        owner_id: user._id,
        group_name,
        group_description,
        group_img: imageFile?.location ? imageFile.location : null,
        created_at: curr,
      });
      const createdGroupData = await Group.save();
      res.status(200).send({
        status: 200,
        message: "success create group",
        data: createdGroupData,
      });
      const findUser = await UserModel.findOneAndUpdate(
        { email: email },
        { $push: { group: createdGroupData._id } }
      );

      await GroupModel.findOneAndUpdate(
        { _id: createdGroupData._id },
        { $push: { group_peoples: findUser._id } }
      );
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

groupRouter.post(
  `/joingroup`,
  validTokenMiddleware,
  async (req: Request, res, next) => {
    const {
      body: { group_id },
    }: {
      body: { group_id: string };
    } = req;

    try {
      const isExistGroup = await GroupModel.findOne({ _id: group_id });
      if (!isExistGroup) {
        return res
          .status(404)
          .send({ status: 400, message: "this group not found!!" });
      }
      // const user = await UserModel.findOne({
      //   email: verifyToken.decoded.email,
      // });
      // if (!user) {
      //   return res
      //     .status(404)
      //     .send({ status: 404, message: "user not found!" });
      // }
      const findUserFollow = await UserModel.findOne({
        email: res.locals.user.email,
      })
        .where("group")
        .in([group_id]);

      if (findUserFollow !== null) {
        return res
          .status(400)
          .send({ status: 400, message: "This user has been group!" });
      }

      const findUser = await UserModel.findOneAndUpdate(
        { email: res.locals.user.email },
        { $push: { group: group_id } }
      );

      await GroupModel.findOneAndUpdate(
        { _id: group_id },
        {
          $push: { group_peoples: findUser._id },
          group_people_count: (isExistGroup.group_people_count += 1),
        }
      );

      return res.status(200).send({
        status: 200,
        message: "success join group",
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

groupRouter.post(
  `/leavegroup`,
  validTokenMiddleware,
  async (req: Request, res, next) => {
    const {
      body: { group_id },
    }: {
      body: { group_id: string };
    } = req;
    // const authToken = req.headers[`authorization`];
    // if (!authToken) {
    //   return res.status(401).send({ status: 401, message: "Unauthorized Token" });
    // }
    // const token = authToken.split(` `)[1];
    // const verifyToken: any = jwt.verify(token);
    // if (verifyToken.status) {
    try {
      const isExistGroup = await GroupModel.findOne({ _id: group_id });
      if (!isExistGroup) {
        return res
          .status(404)
          .send({ status: 400, message: "this group not found!!" });
      }
      const findUser = await UserModel.findOneAndUpdate(
        { email: res.locals.user.email },
        { $pull: { group: group_id } }
      );

      await GroupModel.findOneAndUpdate(
        { _id: group_id },
        {
          $pull: { group_peoples: findUser._id },
          group_people_count: (isExistGroup.group_people_count -= 1),
        }
      );
      return res.status(200).send({
        status: 200,
        message: "success leave group",
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
    // } else {
    //   return res.status(401).send({
    //     status: 401,
    //     message: "Unauthorized Token",
    //     err: verifyToken.err,
    //   });
    // }
  }
);

groupRouter.post(
  `/readgroup`,
  validTokenMiddleware,
  async (req: Request, res, next) => {
    const { page }: { page: number } = req.body;

    try {
      const findUser = await UserModel.findOne(
        {
          email: res.locals.user.email,
        },
        ["group"]
      ).populate({
        path: "group",
        populate: {
          path: "owner_id",
          select: ["user_name", "email", "user_img"],
        },
      });
      if (!findUser) {
        res.status(404).send({ status: 404, message: "user not found!" });
      }
      res
        .status(201)
        .send({ status: 201, massage: "group read success", data: findUser });
    } catch (err) {
      console.log(err);
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

groupRouter.patch(
  `/patchgroup`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const { group_id, description }: { group_id: string; description: string } =
      req.body;
    try {
      const findGroup = await GroupModel.findOne({ _id: group_id });
      if (!findGroup)
        return res
          .status(404)
          .send({ status: 404, message: "없는 그룹입니다." });

      await GroupModel.updateOne(
        { _id: group_id },
        { group_description: description }
      );
      return res.status(200).send({status:200 , message:"수정 성공"});
    } catch (err) {
      console.log(err);
      return res.status(500).send({ status: 500, message: "Failed", err });
    }
  }
);

groupRouter.post(`/groupdetail`, async (req: Request, res, next) => {
  const {
    body: { group_id, user_id },
  }: { body: { group_id: string; user_id: string } } = req;

  try {
    const Group = await GroupModel.findOne(
      { _id: group_id },
      {
        _id: 1,
        group_name: 1,
        group_description: 1,
        group_people_count: 1,
        group_img: 1,
      }
    )
      .populate({
        path: "owner_id",
        select: ["user_name", "email", "user_img"],
      })
      .populate({
        path: "group_peoples",
        select: ["user_name", "email", "user_img"],
      });

    const isJoinGroup = await GroupModel.findOne({});

    return res
      .status(201)
      .send({ status: 201, message: "success read groupDetail", Group });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: 500, message: "Failed", err });
  }
});

groupRouter.delete(
  `/deletegroup`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {}
);

export default groupRouter;
