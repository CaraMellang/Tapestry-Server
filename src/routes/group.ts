import express, { NextFunction, Request, Response } from "express";
import { UserModel, GroupModel } from "../Model/RootModel";
import bcrypt from "bcrypt";
import jwt from "../lib/jwt";
import { uploadImage } from "../lib/multer";
import { FileContent } from "aws-sdk/clients/codecommit";

const groupRouter = express.Router();

groupRouter.post(
  "/create",
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

    // const authToken = req.headers[`authorization`];
    // if (!authToken) {
    //   return res
    //     .status(401)
    //     .send({ status: 401, message: "Unauthorized Token" });
    // }
    // const token = authToken.split(` `)[1];
    // const verifyToken: any = jwt.verify(token);

    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
    const curr = new Date(utc);

    // if (verifyToken.status) {
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
        group_img: imageFile.location,
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
    // } else {
    //   return res.status(401).send({
    //     status: 401,
    //     message: "Unauthorized Token",
    //     err: verifyToken.err,
    //   });
    // }
  }
);

groupRouter.post(`/joingroup`, async (req: Request, res, next) => {
  const {
    body: { group_id },
  }: {
    body: { group_id: string };
  } = req;

  const authToken = req.headers[`authorization`];
  if (!authToken) {
    return res.status(401).send({ status: 401, message: "Unauthorized Token" });
  }
  const token = authToken.split(` `)[1];
  const verifyToken: any = jwt.verify(token);
  if (verifyToken.status) {
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
        email: verifyToken.decoded.email,
      })
        .where("group")
        .in([group_id]);

      if (findUserFollow !== null) {
        return res
          .status(400)
          .send({ status: 400, message: "This user has been group!" });
      }

      const findUser = await UserModel.findOneAndUpdate(
        { email: verifyToken.decoded.email },
        { $push: { group: group_id } }
      );

      await GroupModel.findOneAndUpdate(
        { _id: group_id },
        {
          $push: { group_peoples: findUser._id },
          group_people_count: (isExistGroup.group_people_count += 1),
        }
      );

      return res.status(201).send({
        status: 201,
        message: "success join group",
      });
    } catch (err) {
      console.log(err);
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

groupRouter.post(`/leavegroup`, async (req: Request, res, next) => {
  const {
    body: { group_id },
  }: {
    body: { group_id: string };
  } = req;
  const authToken = req.headers[`authorization`];
  if (!authToken) {
    return res.status(401).send({ status: 401, message: "Unauthorized Token" });
  }
  const token = authToken.split(` `)[1];
  const verifyToken: any = jwt.verify(token);
  if (verifyToken.status) {
    try {
      const isExistGroup = await GroupModel.findOne({ _id: group_id });
      if (!isExistGroup) {
        return res
          .status(404)
          .send({ status: 400, message: "this group not found!!" });
      }
      const findUser = await UserModel.findOneAndUpdate(
        { email: verifyToken.decoded.email },
        { $pull: { group: group_id } }
      );

      await GroupModel.findOneAndUpdate(
        { _id: group_id },
        {
          $pull: { group_peoples: findUser._id },
          group_people_count: (isExistGroup.group_people_count -= 1),
        }
      );
      return res.status(201).send({
        status: 201,
        message: "success leave group",
      });
    } catch (err) {
      console.log(err);
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

groupRouter.post(`/readgroup`, async (req: Request, res, next) => {
  const {
    body: { page },
  }: {
    body: { page: number };
  } = req;

  const authToken = req.headers[`authorization`];
  if (!authToken) {
    return res.status(401).send({ status: 401, message: "Unauthorized Token" });
  }
  const token = authToken.split(` `)[1];
  const verifyToken: any = jwt.verify(token);
  if (verifyToken.status) {
    try {
      const findUser = await UserModel.findOne(
        {
          email: verifyToken.decoded.email,
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
  } else {
    return res.status(401).send({
      status: 401,
      message: "Unauthorized Token",
      err: verifyToken.err,
    });
  }
});

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

// groupRouter.post( 삭제예정
//   `/tteesstt`,
//   (req: Request, res, next) => {
//     console.log("윗놈", req.file);
//     const authToken = req.headers[`authorization`];
//     if (!authToken) {
//       return res
//         .status(401)
//         .send({ status: 401, message: "Unauthorized Token" });
//     }
//     const token = authToken.split(` `)[1];
//     const verifyToken: any = jwt.verify(token);
//     if (verifyToken.status) {
//       console.log(verifyToken);
//       res.locals.user = {
//         email: verifyToken.decoded.email,
//         user_name: verifyToken.decoded.user_name,
//       };
//       next();
//     } else {
//       return res.status(401).send({
//         status: 401,
//         message: "Unauthorized Token",
//         err: verifyToken.err,
//       });
//     }
//   },
//   uploadImage.single("group_img"),
//   async (req: Request, res, next) => {
//     console.log(req.body);
//     console.log(req.file);
//     const authToken = req.headers[`authorization`];
//     const { email, user_name } = res.locals.user;
//     console.log("킥킥킥", res.locals.user, email, user_name);
//     console.log(authToken);
//     return res.send({ d: "끝" });
//   }
// );

// groupRouter.post(
//   `/uploadtest`,
//   uploadImage.single("group_img"),
//   async (req: Request, res, next) => {
//     const {
//       body: { group_name, group_description },
//     }: { body: { group_name: string; group_description: string } } = req;
//     let file: any = req.file;
//     console.log("파일", file);

//     const authToken = req.headers[`authorization`];
//     if (!authToken) {
//       return res
//         .status(401)
//         .send({ status: 401, message: "Unauthorized Token" });
//     }
//     console.log("잉잉", group_name, group_description);
//     console.log(req.body);
//     return res.status(201).send({ message: "됐나?" });
//   }
// );

export default groupRouter;
