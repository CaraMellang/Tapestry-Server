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
const validTokenMiddleware_1 = __importDefault(require("../lib/validTokenMiddleware"));
const RootModel_1 = require("../Model/RootModel");
const likeRouter = express_1.default.Router();
likeRouter.patch("/like", validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id } = req.body;
    try {
        const findPost = yield RootModel_1.PostModel.findOne({ _id: post_id });
        if (!findPost)
            return res
                .status(404)
                .send({ status: 404, message: "존재하지 않는 게시글입니다." });
        const findUser = yield RootModel_1.UserModel.findOne({
            email: res.locals.user.email,
        });
        if (!findUser)
            return res
                .status(404)
                .send({ status: 404, message: "존재하지 않는 유저입니다." });
        yield RootModel_1.PostModel.updateOne({ _id: post_id }, {
            like_count: findPost.like_count + 1,
            $push: { like_user: findUser._id },
        });
        return res.status(201).send({ status: 201, message: "좋아요 완료" });
    }
    catch (err) {
        return res.status(500).send({ status: 500, message: "Failed", err });
    }
}));
likeRouter.patch("/dislike", validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id } = req.body;
    try {
        const findPost = yield RootModel_1.PostModel.findOne({ _id: post_id });
        if (!findPost)
            return res
                .status(404)
                .send({ status: 404, message: "존재하지 않는 게시글입니다." });
        const findUser = yield RootModel_1.UserModel.findOne({
            email: res.locals.user.email,
        });
        if (!findUser)
            return res
                .status(404)
                .send({ status: 404, message: "존재하지 않는 유저입니다." });
        yield RootModel_1.PostModel.updateOne({ _id: post_id }, {
            like_count: findPost.like_count - 1,
            $pull: { like_user: findUser._id },
        });
        return res.status(201).send({ status: 201, message: "좋아요 취소 완료" });
    }
    catch (err) {
        return res.status(500).send({ status: 500, message: "Failed", err });
    }
}));
exports.default = likeRouter;
