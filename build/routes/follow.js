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
const followRouter = express_1.default.Router();
followRouter.patch(`/following`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, following_user_id, } = req.body;
    if (user_id === following_user_id)
        return res
            .status(403)
            .send({ status: 403, message: "잘못된 접근입니다." });
    try {
        const findFollowingUser = yield RootModel_1.UserModel.findOne({
            _id: following_user_id,
        });
        if (!findFollowingUser)
            return res.status(404).send({
                status: 404,
                message: "The user has been deleted or does not exist.",
            });
        // 나중에 두 쿼리를 합칠 필요가있음.
        const findUserFollow = yield RootModel_1.UserModel.findOne({ _id: user_id })
            .where("follow")
            .in([following_user_id]);
        if (findUserFollow !== null) {
            return res
                .status(400)
                .send({ status: 400, message: "This user has been follow!" });
        }
        yield RootModel_1.UserModel.updateOne({ _id: user_id }, { $push: { follow: following_user_id } });
        //프론트는 status 가 200일때 팔로우 되었음으로 인식하게 하도록.
        res.status(200).send({
            status: 200,
            message: "success follow",
        });
    }
    catch (err) {
        return res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
followRouter.patch(`/unfollowing`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, following_user_id, } = req.body;
    if (user_id === following_user_id)
        return res
            .status(403)
            .send({ status: 403, message: "잘못된 접근입니다." });
    try {
        const findUserFollow = yield RootModel_1.UserModel.findOne({ _id: user_id })
            .where("follow")
            .in([following_user_id]);
        if (findUserFollow === null) {
            return res
                .status(404)
                .send({ status: 404, message: "Can not see follow user!" });
        }
        yield RootModel_1.UserModel.updateOne({ _id: user_id }, { $pull: { follow: following_user_id } });
        return res.status(200).send({ status: 200, message: "unfollow success" });
    }
    catch (err) {
        return res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
exports.default = followRouter;
