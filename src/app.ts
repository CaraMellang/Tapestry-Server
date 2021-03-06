import express from "express";
import session from "express-session";
import cors from "cors";
import authRouter from "./routes/auth";
import Mongoose from "mongoose";
import groupRouter from "./routes/group";
import postRouter from "./routes/post";
import followRouter from "./routes/follow";
import commentRouter from "./routes/comment";
import GooglePassportStrategy from "./lib/passport";
import passport from "passport";
import searchRouter from "./routes/search";
import profileRouter from "./routes/profile";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";
dotenv.config();

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://d14utnrre6civk.cloudfront.net",
    credentials: true,
  })
);
app.use(cookieParser());

//Express 4.x버전부터 body-parser모듈 내장
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(
//   session({
//     name:"session",
//     secret: "key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(function(user:any, done) {
//   console.log("serial",user)
//   done(null, user);
// });

// passport.deserializeUser(function(user:any, done) {
//   console.log("deserial",user)
//   done(null, user);
// });

GooglePassportStrategy(passport);

console.log("ec2 test");
app.get("/", (req, res) => {
  res.send("ec2 테스트용");
});
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
app.use("/follow", followRouter);
app.use("/comment", commentRouter);
app.use("/search", searchRouter);
app.use("/profile", profileRouter);

const port = 4000;

if (process.env.NODE_ENV === "development") {
  app.listen(port, () => {
    console.log(`listening port ${port}`);
  });
} else {
  const option = {
    ca: fs.readFileSync(`/etc/letsencrypt/live/mellang.xyz/fullchain.pem`),
    key: fs.readFileSync(`/etc/letsencrypt/live/mellang.xyz/privkey.pem`),
    cert: fs.readFileSync(`/etc/letsencrypt/live/mellang.xyz/cert.pem`),
  };
  https.createServer(option, app).listen(port, () => {
    console.log(`apply https and listening port ${port}`);
  });
}
