"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RootModel_1 = require("../Model/RootModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = __importDefault(require("../lib/jwt"));
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const userModel = RootModel.userModel();
const authRouter = express_1.default.Router();
authRouter.get(`/google`, passport_1.default.authenticate("google", { scope: ["email", "profile"] }));
authRouter.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: "/",
}), function (req, res) {
    // Successful authentication, redirect home.
    console.log("callback", res.req.user.data.User);
    const aceessToken = jwt_1.default.sign(res.req.user.data.User.toJSON());
    return res
        .cookie("access_token", aceessToken, {
        // httpOnly: true,
        maxAge: 60 * 60 * 1000,
    })
        .redirect("http://localhost:3000");
});
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
authRouter.post(`/signup`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username, userImg, } = req.body;
    let curr;
    if (process.env.NODE_ENV === "development") {
        curr = new Date();
    }
    else {
        const date = new Date();
        const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
        curr = new Date(utc);
    }
    const User = new RootModel_1.UserModel({
        email,
        password,
        user_name: username,
        created_at: curr,
        provider: "local",
    });
    try {
        let findUser = yield RootModel_1.UserModel.findOne({ email }).exec();
        if (findUser !== null) {
            return res.status(400).send({ status: 400, message: "invailed email!" });
        }
        yield User.save();
        console.log("성공?");
        return res.status(201).send({ status: 201, message: `signup Success` });
    }
    catch (err) {
        return res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
authRouter.post(`/signin`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { email, password }, } = req;
    try {
        let findUser = yield RootModel_1.UserModel.findOne({ email }).populate({
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
        }
        else {
            const comparedPassword = yield bcrypt_1.default.compare(password.toString(), findUser.password);
            if (!comparedPassword) {
                return res
                    .status(401)
                    .send({ status: 401, message: "Passwords do not match." });
            }
            const accessToken = jwt_1.default.sign({
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
    }
    catch (err) {
        console.log(err);
        res.status(400).send({ status: 400, message: "err" });
    }
}));
authRouter.post("/verify", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = req.headers[`cookie`];
    console.log("안녕하세요", req.headers);
    if (!authToken) {
        return res.status(401).send({ status: 401, message: "Unauthorized Token" });
    }
    const token = authToken.split(`=`)[1];
    const verifyToken = jwt_1.default.verify(token);
    try {
        if (verifyToken.status) {
            let findUser = yield RootModel_1.UserModel.findOne({
                email: verifyToken.decoded.email,
            }, ["user_name", "email", "user_img", "created_at"]).populate({
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
            let { email, user_name, created_at, _id, user_img, follow, group } = findUser;
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
        }
        else {
            return res.status(401).send({
                status: 401,
                message: "Unauthorized Token",
                err: verifyToken.err,
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).send({ status: 400, message: "err" });
    }
}));
authRouter.post(`/test`, (req, res, net) => {
    var _a;
    const authToken = (_a = req.headers[`cookie`]) === null || _a === void 0 ? void 0 : _a.split("=")[1];
    console.log("토", authToken);
    return res.send({ msg: "퉤" });
});
exports.default = authRouter;
