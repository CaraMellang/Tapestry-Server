import express from "express";
import RootModel from "../Model/RootModel";

const userModel = RootModel.userModel();

const authRouter = express.Router();

authRouter.post(`/signup`, (req, res, next) => {
  const User = new userModel({
    email: "dd@naver.com",
    password: "1234",
    user_name: "dd",
  });
  User.save();
  userModel
    .findOne({ email: "dd@naver.com" })
    .then((r) => {
      console.log(r);
      res.status(200).send({ msg: `signup path`, r });
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send({ msg: "실패" });
    });
});

export default authRouter;
