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
const multer_1 = require("../lib/multer");
const validTokenMiddleware_1 = __importDefault(require("../lib/validTokenMiddleware"));
const RootModel_1 = require("../Model/RootModel");
const profileRouter = express_1.default.Router();
profileRouter.post("/test", (req, res, next) => {
    const dddd = req.headers;
    if (!dddd["cookie"])
        return res.status(404).send({ msg: "실패라는데?" });
    console.log("너니?", dddd["cookie"].split("=")[1]);
});
profileRouter.patch(`/setname`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { update_user_name } = req.body;
    if (update_user_name === "" || !update_user_name) {
        return res
            .status(500)
            .send({ status: 500, message: "입력값이 없습니다!" });
    }
    try {
        const isUser = yield RootModel_1.UserModel.findOne({ email: res.locals.user.email });
        if (!isUser)
            return res
                .status(404)
                .send({ status: 404, message: "사용자를 찾을수 없습니다." });
        const updateUser = yield RootModel_1.UserModel.updateOne({ email: res.locals.user.email }, { user_name: update_user_name });
        return res
            .status(200)
            .send({ status: 200, message: "업데이트 완료", updateUser });
    }
    catch (err) {
        res
            .status(500)
            .send({ status: 500, message: "에러가 발생했습니다.", err });
    }
}));
profileRouter.patch(`/setimage`, validTokenMiddleware_1.default, multer_1.uploadProfile.single("profile_img"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let imageFile = req.file;
    try {
        const findUser = yield RootModel_1.UserModel.findOne({
            email: res.locals.user.email,
        });
        const { user_img } = findUser;
        if (user_img) {
            yield multer_1.s3
                .deleteObject({
                Bucket: "tapestry-image-bucket",
                Key: `tapestry/profile/${decodeURIComponent(user_img.split("tapestry/profile/")[1])}`,
            })
                .promise();
        }
        yield RootModel_1.UserModel.updateOne({ email: res.locals.user.email }, { user_img: imageFile.location });
        return res.status(201).send({ status: 201, message: "업데이트 성공" });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
exports.default = profileRouter;
