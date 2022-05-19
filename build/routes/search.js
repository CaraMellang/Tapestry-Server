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
const searchRouter = express_1.default.Router();
searchRouter.post(`/`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    {
        const { body: { search, page, type }, } = req;
        console.log(type);
        console.log(page);
        console.log(search);
        try {
            if (type === "group") {
                const groupData = yield RootModel_1.GroupModel.find({
                    group_name: { $regex: search },
                })
                    .sort({ created_at: -1 })
                    .skip((page - 1) * 10)
                    .limit(10);
                return res.send({ data: groupData });
            }
            if (type === "post") {
                const postData = yield RootModel_1.PostModel.find({ text: { $regex: search } })
                    .populate([
                    "group_id",
                    { path: "owner_id", select: ["user_name", "email", "user_img"] },
                ])
                    .sort({ created_at: -1 }) //내림차순 정렬
                    .skip((page - 1) * 10) //건너뛸 문서
                    .limit(10); //가져울 문서 제한
                return res.send({ data: postData });
            }
            if (type === "user") {
                const userData = yield RootModel_1.UserModel.find({
                    user_name: { $regex: search },
                })
                    .sort({ created_at: -1 })
                    .skip((page - 1) * 10)
                    .limit(10);
                return res.send({ data: userData });
            }
            if (!type || type === "") {
                return res
                    .status(400)
                    .send({ status: 400, message: "Invailed type data!" });
            }
            return res.status(501).send({ status: 501, message: "Not implemented" });
        }
        catch (err) {
            console.log(err);
            res.status(400).send({ status: 400, message: "err" });
            next(err);
        }
    }
}));
exports.default = searchRouter;
