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

const app = express();

//Express 4.x버전부터 body-parser모듈 내장
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: "key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user:any, done) {
  done(null, user);
});

passport.deserializeUser(function(user:any, done) {
  done(null, user);
});

GooglePassportStrategy(passport);

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

const port = 5000;

app.listen(port, () => {
  console.log(`listening port ${port}`);
});
