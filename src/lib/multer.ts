import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import {v4} from "uuid";
import dotenv from "dotenv";
dotenv.config();


const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ? process.env.S3_ACCESS_KEY : "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
      ? process.env.S3_SECRET_ACCESS_KEY
      : "",
  },
  region: process.env.S3_REGION ? process.env.S3_REGION : "",
});

const multerUpload = multerS3({
  s3: s3,
  bucket: "tapestry-image-bucket/tapestry/images", // 둘중에 뭐가  폴더 형성인지;; 일단 얘를 따르긴해
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: "public-read",
  key: (req, file, cb) => {
    console.log("파일정보(multer.ts)", file);
    cb(null, v4() + file.originalname);
  },
});

export const uploadImage = multer({
  storage: multerUpload,
});
