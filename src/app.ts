import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import Mongoose from "mongoose";
import groupRouter from "./routes/group";
import postRouter from "./routes/post";

const app = express();

//Express 4.x버전부터 body-parser모듈 내장
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const mongoUrl = "mongodb://localhost:27017/tapestry";
console.log(mongoUrl);
Mongoose.connect(mongoUrl)
  .then(() => {
    console.log("Connect!!");
  })
  .catch((e) => {
    console.log(`Error!`, e);
  });

app.use("/auth", authRouter);
app.use("/group", groupRouter);
app.use("/post", postRouter);

const port = 5000;

app.listen(port, () => {
  console.log(`listening port ${port}`);
});
