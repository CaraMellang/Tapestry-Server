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
const validTokenMiddleware_1 = __importDefault(require("../../lib/validTokenMiddleware"));
const RootModel_1 = require("../../Model/RootModel");
const ParantCommentRouter = express_1.default.Router();
ParantCommentRouter.post(`/read`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id } = req.body;
    try {
        const findPost = yield RootModel_1.PostModel.findOne({ _id: post_id });
        if (!findPost)
            return res
                .status(404)
                .send({ status: 404, message: "게시글이 존재하지않음." });
        const findPostComment = yield RootModel_1.ParantCommentModel.find({ post_id }).populate([
            { path: "owner_id", select: ["_id", "email", "user_name", "user_img"] },
            {
                path: "child_comment",
                populate: {
                    path: "owner_id",
                    select: ["_id", "email", "user_name", "user_img"],
                },
            },
        ]);
        return res
            .status(201)
            .send({ status: 201, message: "성공", data: findPostComment });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
ParantCommentRouter.post(`/create`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { post_id, user_id, text }, } = req;
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
    const curr = new Date(utc);
    try {
        const findPost = yield RootModel_1.PostModel.findOne({ _id: post_id });
        if (!findPost)
            return res.status(404).send({ status: 404, message: "post not found" });
        const ParantComment = new RootModel_1.ParantCommentModel({
            post_id,
            owner_id: user_id,
            text,
            created_at: curr,
        });
        yield ParantComment.save();
        yield RootModel_1.PostModel.findOneAndUpdate({ _id: post_id }, { $push: { comment: ParantComment._id } });
        return res
            .status(201)
            .send({ status: 201, message: "success parantComment save" });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
ParantCommentRouter.delete(`/delete`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment_id, user_id } = req.body;
    try {
        const findParantComment = yield RootModel_1.ParantCommentModel.findOne({
            _id: comment_id,
        });
        if (!findParantComment)
            return res
                .status(404)
                .send({ status: 404, message: "comment not found" });
        yield RootModel_1.ParantCommentModel.deleteOne({ _id: comment_id });
        yield RootModel_1.ChildCommentModel.deleteMany({ parant_comment_id: comment_id });
        return res
            .status(200)
            .send({ status: 200, message: "success delete comment" });
    }
    catch (err) {
        return res.status(500).send({ status: 500, message: "Failed", err });
    }
}));
ParantCommentRouter.patch(`/update`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.default = ParantCommentRouter;
