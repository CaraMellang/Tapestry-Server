import express from "express";
import { UserModel, GroupModel } from "../Schema/RootModel";
import bcrypt from "bcrypt";
import jwt from "../lib/jwt";

// const groupModel = RootModel.groupModel();
// const userModel = RootModel.userModel();

const groupRouter = express.Router();

groupRouter.post("/create", async (req: any, res, next) => {
  const {
    body: { group_name, group_description, group_img },
  }: {
    body: { group_name: string; group_description: string; group_img: string };
  } = req;

  const splitArray = req.headers.authorization.split(` `);
  const token = splitArray[1];
  const verifyToken: any = jwt.verify(token);

  const date = new Date();
  const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
  const curr = new Date(utc);

  if (verifyToken.status) {
    try {
      const verifyGroupName = await GroupModel.findOne({}).exec();
      if (verifyGroupName) {
        return res
          .status(400)
          .send({ status: 400, message: "invailed group name!" });
      }
      const user = await UserModel.findOne({
        email: verifyToken.decoded.email,
      }).exec();

      if (!user)
        return res
          .status(404)
          .send({ status: 404, message: "user not found!" });

      const Group = new GroupModel({
        owner_id: user._id,
        group_name,
        group_description,
        group_img,
        group_people_count: 1,
        created_at: curr,
      });
      const createdGroupData = await Group.save();
      res.status(200).send({
        status: 200,
        message: "success create group",
        data: createdGroupData,
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
});

export default groupRouter;
