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
const multer_1 = require("../lib/multer");
const validTokenMiddleware_1 = __importDefault(require("../lib/validTokenMiddleware"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groupRouter = express_1.default.Router();
groupRouter.get(`/readgroupmember`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { group_id, user_id } = req.query;
    try {
        const findGroup = yield RootModel_1.GroupModel.findOne({ _id: group_id }).populate([
            {
                path: "group_peoples",
                select: ["user_name", "email", "user_img"],
            },
            { path: "owner_id", select: ["user_name", "email", "user_img"] },
        ]);
        if (!findGroup)
            return res
                .status(404)
                .send({ status: 404, message: "존재하지 않는 그룹입니다." });
        const findUser = yield RootModel_1.UserModel.findOne({ _id: user_id });
        return res.status(200).send({
            status: 200,
            data: { group: findGroup, follows: findUser.follow },
        });
    }
    catch (err) {
        return res.status(500).send({ status: 500, message: "Failed", err });
    }
}));
groupRouter.patch(`/patchfollow`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const {} = req.body;
}));
groupRouter.patch(`/patchunfollow`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const {} = req.body;
}));
groupRouter.post("/create", validTokenMiddleware_1.default, multer_1.uploadImage.single("group_img"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { group_name, group_description }, } = req;
    const { email, user_name } = res.locals.user;
    let imageFile = req.file;
    // imageFile = {
    //   fieldname: null,
    //   originalname:null ,
    //   encoding: null,
    //   mimetype: null,
    //   size: null,
    //   bucket: null,
    //   key: null,
    //   acl: null,
    //   contentType: null,
    //   contentDisposition: null,
    //   contentEncoding: null,
    //   storageClass: null,
    //   serverSideEncryption: null,
    //   metadata: null,
    //   location: null,
    //   etag: null,
    //   versionId: undefined
    // }
    let curr;
    if (process.env.NODE_ENV === "development") {
        curr = new Date();
    }
    else {
        const date = new Date();
        const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
        curr = new Date(utc);
    }
    try {
        const verifyGroupName = yield RootModel_1.GroupModel.findOne({ group_name }).exec();
        if (verifyGroupName) {
            return res
                .status(400)
                .send({ status: 400, message: "invailed group name!" });
        }
        const user = yield RootModel_1.UserModel.findOne({
            email: email,
        });
        if (!user)
            return res
                .status(404)
                .send({ status: 404, message: "user not found!" });
        const Group = new RootModel_1.GroupModel({
            owner_id: user._id,
            group_name,
            group_description,
            group_img: (imageFile === null || imageFile === void 0 ? void 0 : imageFile.location) ? imageFile.location : "",
            created_at: curr,
        });
        const createdGroupData = yield Group.save();
        res.status(200).send({
            status: 200,
            message: "success create group",
            data: createdGroupData,
        });
        const findUser = yield RootModel_1.UserModel.findOneAndUpdate({ email: email }, { $push: { group: createdGroupData._id } });
        yield RootModel_1.GroupModel.findOneAndUpdate({ _id: createdGroupData._id }, { $push: { group_peoples: findUser._id } });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
groupRouter.post(`/joingroup`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { group_id }, } = req;
    try {
        const isExistGroup = yield RootModel_1.GroupModel.findOne({ _id: group_id });
        if (!isExistGroup) {
            return res
                .status(404)
                .send({ status: 400, message: "this group not found!!" });
        }
        // const user = await UserModel.findOne({
        //   email: verifyToken.decoded.email,
        // });
        // if (!user) {
        //   return res
        //     .status(404)
        //     .send({ status: 404, message: "user not found!" });
        // }
        const findUserFollow = yield RootModel_1.UserModel.findOne({
            email: res.locals.user.email,
        })
            .where("group")
            .in([group_id]);
        if (findUserFollow !== null) {
            return res
                .status(400)
                .send({ status: 400, message: "This user has been group!" });
        }
        const findUser = yield RootModel_1.UserModel.findOneAndUpdate({ email: res.locals.user.email }, { $push: { group: group_id } });
        yield RootModel_1.GroupModel.findOneAndUpdate({ _id: group_id }, {
            $push: { group_peoples: findUser._id },
            group_people_count: (isExistGroup.group_people_count += 1),
        });
        return res.status(200).send({
            status: 200,
            message: "success join group",
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
groupRouter.post(`/leavegroup`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { group_id }, } = req;
    // const authToken = req.headers[`authorization`];
    // if (!authToken) {
    //   return res.status(401).send({ status: 401, message: "Unauthorized Token" });
    // }
    // const token = authToken.split(` `)[1];
    // const verifyToken: any = jwt.verify(token);
    // if (verifyToken.status) {
    try {
        const isExistGroup = yield RootModel_1.GroupModel.findOne({ _id: group_id });
        if (!isExistGroup) {
            return res
                .status(404)
                .send({ status: 400, message: "this group not found!!" });
        }
        const findUser = yield RootModel_1.UserModel.findOneAndUpdate({ email: res.locals.user.email }, { $pull: { group: group_id } });
        yield RootModel_1.GroupModel.findOneAndUpdate({ _id: group_id }, {
            $pull: { group_peoples: findUser._id },
            group_people_count: (isExistGroup.group_people_count -= 1),
        });
        return res.status(200).send({
            status: 200,
            message: "success leave group",
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
    // } else {
    //   return res.status(401).send({
    //     status: 401,
    //     message: "Unauthorized Token",
    //     err: verifyToken.err,
    //   });
    // }
}));
groupRouter.post(`/readgroup`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { page }, } = req;
    try {
        const findUser = yield RootModel_1.UserModel.findOne({
            email: res.locals.user.email,
        }, ["group"]).populate({
            path: "group",
            populate: {
                path: "owner_id",
                select: ["user_name", "email", "user_img"],
            },
        });
        if (!findUser) {
            res.status(404).send({ status: 404, message: "user not found!" });
        }
        res
            .status(201)
            .send({ status: 201, massage: "group read success", data: findUser });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
groupRouter.post(`/groupdetail`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { group_id, user_id }, } = req;
    try {
        const Group = yield RootModel_1.GroupModel.findOne({ _id: group_id }, {
            _id: 1,
            group_name: 1,
            group_description: 1,
            group_people_count: 1,
            group_img: 1,
        })
            .populate({
            path: "owner_id",
            select: ["user_name", "email", "user_img"],
        })
            .populate({
            path: "group_peoples",
            select: ["user_name", "email", "user_img"],
        });
        const isJoinGroup = yield RootModel_1.GroupModel.findOne({});
        return res
            .status(201)
            .send({ status: 201, message: "success read groupDetail", Group });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ status: 500, message: "Failed", err });
    }
}));
groupRouter.delete(`/deletegroup`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { }));
exports.default = groupRouter;
