import express, { NextFunction, Request, Response } from "express";
import jwt from "../lib/jwt";
import { s3, uploadImage } from "../lib/multer";
import validTokenMiddleware from "../lib/validTokenMiddleware";
import {
  ChildCommentModel,
  GroupModel,
  ParantCommentModel,
  PostModel,
  UserModel,
} from "../Model/RootModel";
import likeRouter from "./like";
import dotenv from "dotenv";
dotenv.config();

const postRouter = express.Router();

postRouter.post(
  `/create`,
  validTokenMiddleware,
  uploadImage.array("post_imgs"),
  async (req: Request, res, next) => {
    const {
      body: { group_id, email, is_private, text },
    }: {
      body: {
        group_id: string;
        email: string;
        is_private: string;
        text: string;
      };
    } = req;
    let imageFile: any = req.files;
    let imgLocationArr = imageFile.map((item: any) => item.location);

    let curr: Date;
    if (process.env.NODE_ENV === "development") {
      curr = new Date();
    } else {
      const date = new Date();
      const utc = date.getTime() + date.getTimezoneOffset() * -1 * 60 * 1000;
      curr = new Date(utc);
    }

    try {
      const isExistGroup = await GroupModel.findOne({ _id: group_id }).exec();
      if (!isExistGroup) {
        return res
          .status(404)
          .send({ status: 404, message: "group is not found!" });
      }
      const writer = await UserModel.findOne({ email }).exec();
      const Post = new PostModel({
        group_id,
        owner_id: writer._id,
        is_private,
        text,
        images: imgLocationArr,
        created_at: curr,
      });
      await Post.save();
      return res
        .status(200)
        .send({ status: 200, message: "create post successed" });
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

postRouter.get(
  `/getpost`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const { post_id } = req.query;
    try {
      const findPost = await PostModel.findOne({
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
    } catch (err) {
      return res.status(500).send({ status: 500, message: "Failed", err });
    }
  }
);

postRouter.post(`/readgrouparr`, async (req: Request, res, next) => {
  const {
    body: { group_arr, page },
  }: {
    body: {
      page: number;
      group_arr: [];
    };
  } = req;
  try {
    const isExistGroupArr = await GroupModel.find({ _id: group_arr });
    // const isExistGroupArr = await GroupModel.find({ group_arr }); 왜 둘다 되는거임?
    if (!isExistGroupArr) {
      return res
        .status(404)
        .send({ status: 404, message: "group is not found" });
    }
    const Posts = await PostModel.find({ group_id: group_arr })
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
  } catch (err) {
    res.status(500).send({ status: 500, message: "Failed", err });
    next(err);
  }
});

postRouter.post(`/readgroup`, async (req: Request, res, next) => {
  const {
    body: { group_id, page },
  }: {
    body: {
      page: number;
      group_id: string;
    };
  } = req;
  try {
    const findPosts = await PostModel.find({ group_id })
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
    // if (!findPosts || findPosts.length <= 0) {
    //   return res.status(404).send({
    //     status: 404,
    //     message: "존재하지 않거나 마지막 페이지 입니다.",
    //     page_end: true,
    //   });
    // }
    return res.status(201).send({
      status: 200,
      message: "success read",
      data: findPosts,
    });
  } catch (err) {
    res.status(500).send({ status: 500, message: "Failed", err });
    next(err);
  }
});

postRouter.get(
  `/newfeed`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const search = req.query.search as unknown as string;
    const page = req.query.page as unknown as number;
    try {
      const findPosts = await PostModel.find({})
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
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

postRouter.get(
  "/popularfeed",
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const search = req.query.search as unknown as string;
    const page = req.query.page as unknown as number;
    try {
      const findPosts = await PostModel.find({})
        .where("like_count")
        .gt(0)
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
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

postRouter.get(
  "/groupfeed",
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const search = req.query.search as unknown as [];
    const page = req.query.page as unknown as number;
    try {
      if (!search) {
        return res
          .status(404)
          .send({ status: 404, message: "표시할 포스트가 없습니다." });
      }
      const findPosts = await PostModel.find({ search })
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
    } catch (err) {
      res.status(500).send({ status: 500, message: "Failed", err });
      next(err);
    }
  }
);

postRouter.get(`/feeds`, async (req: Request, res: Response, next) => {
  const search = req.query.search as unknown as string | [];
  const page = req.query.page as unknown as number;
  console.log(search, page);
  try {
    if (!search) {
      return res
        .status(404)
        .send({ status: 404, message: "표시할 포스트가 없습니다." });
    }
    const findPosts = await PostModel.find({ search })
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
  } catch (err) {
    res.status(500).send({ status: 500, message: "Failed", err });
    next(err);
  }
});

postRouter.delete(
  `/delete`,
  validTokenMiddleware,
  async (req: Request, res: Response, next) => {
    const { post_id }: { post_id: string } = req.body;
    try {
      const findUser = await UserModel.findOne({
        email: res.locals.user.email,
      });
      if (!findUser)
        return res
          .status(404)
          .send({ status: 404, message: "사용자를 찾을수 없습니다." });

      const findPost = await PostModel.findOne({ _id: post_id });
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
        await s3
          .deleteObjects({
            Bucket: "tapestry-image-bucket",
            Delete: {
              Objects: findPost.images.map((item: string) => {
                return {
                  Key: `tapestry/images/${decodeURIComponent(
                    item.split(`tapestry/images/`)[1]
                  )}`,
                };
              }),
            },
          })
          .promise();
      }
      await PostModel.deleteOne({ _id: post_id });
      await ParantCommentModel.deleteMany({ post_id });
      await ChildCommentModel.deleteMany({ post_id });
      return res
        .status(201)
        .send({ status: 201, message: "정상적으로 삭제되었습니다." });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send({ status: 500, message: "에러가 발생했습니다." });
    }
  }
);

postRouter.use(`/like`, likeRouter);

export default postRouter;
