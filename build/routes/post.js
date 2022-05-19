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
const like_1 = __importDefault(require("./like"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const postRouter = express_1.default.Router();
postRouter.post(`/create`, validTokenMiddleware_1.default, multer_1.uploadImage.array("post_imgs"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { group_id, email, is_private, text }, } = req;
    let imageFile = req.files;
    let imgLocationArr = imageFile.map((item) => item.location);
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
        const isExistGroup = yield RootModel_1.GroupModel.findOne({ _id: group_id }).exec();
        if (!isExistGroup) {
            return res
                .status(404)
                .send({ status: 404, message: "group is not found!" });
        }
        const writer = yield RootModel_1.UserModel.findOne({ email }).exec();
        const Post = new RootModel_1.PostModel({
            group_id,
            owner_id: writer._id,
            is_private,
            text,
            images: imgLocationArr,
            created_at: curr,
        });
        yield Post.save();
        return res
            .status(200)
            .send({ status: 200, message: "create post successed" });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
postRouter.get(`/getpost`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id } = req.query;
    try {
        const findPost = yield RootModel_1.PostModel.findOne({
            _id: post_id,
        })
            .populate([
            "group_id",
            { path: "owner_id", select: ["user_name", "email", "user_img"] },
        ])
            .populate({
            path: "comment",
            populate: [
                {
                    path: "owner_id",
                    select: ["user_name", "email", "user_img"],
                },
                {
                    path: "child_comment",
                    populate: {
                        path: "owner_id",
                        select: ["user_name", "email", "user_img"],
                    },
                },
            ],
        });
        if (!findPost)
            return res
                .status(404)
                .send({ status: 404, message: "게시글을 찾을 수 없습니다." });
        return res.status(200).send({ status: 200, data: findPost });
    }
    catch (err) {
        return res.status(500).send({ status: 500, message: "Failed", err });
    }
}));
postRouter.post(`/readgrouparr`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { group_arr, page }, } = req;
    try {
        const isExistGroupArr = yield RootModel_1.GroupModel.find({ _id: group_arr });
        // const isExistGroupArr = await GroupModel.find({ group_arr }); 왜 둘다 되는거임?
        if (!isExistGroupArr) {
            return res
                .status(404)
                .send({ status: 404, message: "group is not found" });
        }
        const Posts = yield RootModel_1.PostModel.find({ group_id: group_arr })
            .populate([
            "group_id",
            { path: "owner_id", select: ["user_name", "email", "user_img"] },
        ])
            .populate({
            path: "comment",
            populate: [
                {
                    path: "owner_id",
                    select: ["user_name", "email", "user_img"],
                },
                {
                    path: "child_comment",
                    populate: {
                        path: "owner_id",
                        select: ["user_name", "email", "user_img"],
                    },
                },
            ],
        })
            .sort({ created_at: -1 }) //내림차순 정렬
            .skip((page - 1) * 10) //건너뛸 문서
            .limit(10); //가져울 문서 제한
        // const isExistGroup = await GroupModel.findOne({ group_id }).exec();
        // if (!isExistGroup)
        //   return res
        //     .status(404)
        //     .send({ status: 404, message: "group is not found" });
        // const Posts = await PostModel.find({ group_id })
        //   .populate(["group_id", "owner_id"])
        //   .populate({
        //     path: "comment",
        //     populate: {
        //       path: "owner_id",
        //       select: ["user_name", "email", "user_img"],
        //     },
        //   })
        //   .sort({ created_at: -1 }) //내림차순 정렬
        //   .skip((page - 1) * 10) //건너뛸 문서
        //   .limit(10); //가져울 문서 제한
        res.status(200).send({ status: 200, message: "success read", data: Posts });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
postRouter.post(`/readgroup`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { body: { group_id, page }, } = req;
    try {
        const findPosts = yield RootModel_1.PostModel.find({ group_id })
            .populate([
            "group_id",
            { path: "owner_id", select: ["user_name", "email", "user_img"] },
        ])
            .populate({
            path: "comment",
            populate: [
                {
                    path: "owner_id",
                    select: ["user_name", "email", "user_img"],
                },
                {
                    path: "child_comment",
                    populate: {
                        path: "owner_id",
                        select: ["user_name", "email", "user_img"],
                    },
                },
            ],
        })
            .sort({ created_at: -1 }) //내림차순 정렬
            .skip((page - 1) * 10) //건너뛸 문서
            .limit(10); //가져울 문서 제한
        if (!findPosts || findPosts.length <= 0) {
            return res.status(404).send({
                status: 404,
                message: "존재하지 않거나 마지막 페이지 입니다.",
            });
        }
        return res.status(201).send({
            status: 200,
            message: "success read",
            data: findPosts,
        });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
postRouter.get(`/newfeed`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.query.search;
    const page = req.query.page;
    try {
        const findPosts = yield RootModel_1.PostModel.find({})
            .populate([
            "group_id",
            { path: "owner_id", select: ["user_name", "email", "user_img"] },
        ])
            .populate({
            path: "comment",
            populate: [
                {
                    path: "owner_id",
                    select: ["user_name", "email", "user_img"],
                },
                {
                    path: "child_comment",
                    populate: {
                        path: "owner_id",
                        select: ["user_name", "email", "user_img"],
                    },
                },
            ],
        })
            .sort({ created_at: -1 }) //내림차순 정렬
            .skip((page - 1) * 10) //건너뛸 문서
            .limit(10); //가져울 문서 제한
        if (!findPosts || findPosts.length < 10) {
            return res.status(404).send({
                status: 404,
                message: "존재하지 않거나 마지막 페이지 입니다.",
                page_end: true,
            });
        }
        return res.status(201).send({
            status: 200,
            message: "success read",
            data: findPosts,
            page_end: false,
        });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
postRouter.get("/popularfeed", validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.query.search;
    const page = req.query.page;
    try {
        const findPosts = yield RootModel_1.PostModel.find({})
            .populate([
            "group_id",
            { path: "owner_id", select: ["user_name", "email", "user_img"] },
        ])
            .populate({
            path: "comment",
            populate: [
                {
                    path: "owner_id",
                    select: ["user_name", "email", "user_img"],
                },
                {
                    path: "child_comment",
                    populate: {
                        path: "owner_id",
                        select: ["user_name", "email", "user_img"],
                    },
                },
            ],
        })
            .sort({ like_count: -1 })
            .sort({ created_at: -1 }) //내림차순 정렬
            .skip((page - 1) * 10) //건너뛸 문서
            .limit(10); //가져울 문서 제한
        if (!findPosts || findPosts.length <= 0) {
            return res.status(404).send({
                status: 404,
                message: "존재하지 않거나 마지막 페이지 입니다.",
                page_end: true,
            });
        }
        return res.status(201).send({
            status: 200,
            message: "success read",
            data: findPosts,
            page_end: false,
        });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
postRouter.get("/groupfeed", validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.query.search;
    const page = req.query.page;
    try {
        if (!search) {
            return res
                .status(404)
                .send({ status: 404, message: "표시할 포스트가 없습니다." });
        }
        const findPosts = yield RootModel_1.PostModel.find({ search })
            .populate([
            "group_id",
            { path: "owner_id", select: ["user_name", "email", "user_img"] },
        ])
            .populate({
            path: "comment",
            populate: [
                {
                    path: "owner_id",
                    select: ["user_name", "email", "user_img"],
                },
                {
                    path: "child_comment",
                    populate: {
                        path: "owner_id",
                        select: ["user_name", "email", "user_img"],
                    },
                },
            ],
        })
            .sort({ created_at: -1 }) //내림차순 정렬
            .skip((page - 1) * 10) //건너뛸 문서
            .limit(10); //가져울 문서 제한
        if (!findPosts || findPosts.length <= 0) {
            return res.status(404).send({
                status: 404,
                message: "존재하지 않거나 마지막 페이지 입니다.",
                page_end: true,
            });
        }
        return res.status(201).send({
            status: 200,
            message: "success read",
            data: findPosts,
            page_end: false,
        });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
postRouter.get(`/feeds`, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.query.search;
    const page = req.query.page;
    console.log(search, page);
    try {
        if (!search) {
            return res
                .status(404)
                .send({ status: 404, message: "표시할 포스트가 없습니다." });
        }
        const findPosts = yield RootModel_1.PostModel.find({ search })
            .populate([
            "group_id",
            { path: "owner_id", select: ["user_name", "email", "user_img"] },
        ])
            .populate({
            path: "comment",
            populate: [
                {
                    path: "owner_id",
                    select: ["user_name", "email", "user_img"],
                },
                {
                    path: "child_comment",
                    populate: {
                        path: "owner_id",
                        select: ["user_name", "email", "user_img"],
                    },
                },
            ],
        })
            .sort({ created_at: -1 }) //내림차순 정렬
            .skip((page - 1) * 10) //건너뛸 문서
            .limit(10); //가져울 문서 제한
        if (!findPosts || findPosts.length < 10) {
            return res.status(404).send({
                status: 404,
                message: "존재하지 않거나 마지막 페이지 입니다.",
                page_end: true,
            });
        }
        return res.status(201).send({
            status: 200,
            message: "success read",
            data: findPosts,
            page_end: false,
        });
    }
    catch (err) {
        res.status(500).send({ status: 500, message: "Failed", err });
        next(err);
    }
}));
postRouter.delete(`/delete`, validTokenMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id } = req.body;
    try {
        const findUser = yield RootModel_1.UserModel.findOne({
            email: res.locals.user.email,
        });
        if (!findUser)
            return res
                .status(404)
                .send({ status: 404, message: "사용자를 찾을수 없습니다." });
        const findPost = yield RootModel_1.PostModel.findOne({ _id: post_id });
        if (!findPost)
            return res.status(404).send({
                status: 404,
                message: "존재하지 않거나 잘못된 게시물 입니다.",
            });
        if (findPost.owner_id.toString() !== findUser._id.toString())
            return res.status(999).send({
                status: 999,
                message: "사용자와 게시글의 주인번호가 일치하지 않습니다.",
            });
        if (findPost.images.length !== 0) {
            yield multer_1.s3
                .deleteObjects({
                Bucket: "tapestry-image-bucket",
                Delete: {
                    Objects: findPost.images.map((item) => {
                        return {
                            Key: `tapestry/images/${decodeURIComponent(item.split(`tapestry/images/`)[1])}`,
                        };
                    }),
                },
            })
                .promise();
        }
        yield RootModel_1.PostModel.deleteOne({ _id: post_id });
        yield RootModel_1.ParantCommentModel.deleteMany({ post_id });
        yield RootModel_1.ChildCommentModel.deleteMany({ post_id });
        return res
            .status(201)
            .send({ status: 201, message: "정상적으로 삭제되었습니다." });
    }
    catch (err) {
        console.log(err);
        return res
            .status(500)
            .send({ status: 500, message: "에러가 발생했습니다." });
    }
}));
postRouter.use(`/like`, like_1.default);
exports.default = postRouter;
