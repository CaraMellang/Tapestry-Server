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
const ChildCommentRouter = express_1.default.Router();
ChildCommentRouter.get("/read", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { parant_comment_id } = req.query;
    try {
        const findChild = yield RootModel_1.ChildCommentModel.find({
            parant_comment_id,
        }).populate({ path: "owner_id", select: ["_id", "email", "user_name", "user_img"] });
        if (!findChild || findChild.length === 0)
            return res
                .status(404)
                .send({ status: 404, message: "not found childcommnet" });
        return res.status(200).send({
            status: 200,
            message: "success res childcomment",
            data: findChild,
        });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
ChildCommentRouter.post(`/create`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id, parant_comment_id, text, } = req.body;
    const date = new Date();
    const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
    const curr = new Date(utc);
    try {
        const findUser = yield RootModel_1.UserModel.findOne({
            email: res.locals.user.email,
        });
        if (!findUser)
            res.status(404).send({ status: 404, message: "없는 사용자입니다." });
        const findParant = yield RootModel_1.ParantCommentModel.findOne({
            _id: parant_comment_id,
        });
        if (!findParant)
            res.status(404).send({ status: 404, message: "없는 부모댓글입니다." });
        const ChildComment = new RootModel_1.ChildCommentModel({
            post_id,
            parant_comment_id,
            owner_id: findUser._id,
            text,
            created_at: curr,
        });
        yield ChildComment.save();
        yield RootModel_1.ParantCommentModel.updateOne({ _id: parant_comment_id }, { $push: { child_comment: ChildComment._id } });
        return res
            .status(201)
            .send({ status: 201, message: "success create childComment " });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
exports.default = ChildCommentRouter;
