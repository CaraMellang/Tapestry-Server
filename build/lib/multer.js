"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfile = exports.uploadImage = exports.s3 = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.s3 = new aws_sdk_1.default.S3({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ? process.env.S3_ACCESS_KEY : "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
            ? process.env.S3_SECRET_ACCESS_KEY
            : "",
    },
    region: process.env.S3_REGION ? process.env.S3_REGION : "",
});
const multerUpload = (0, multer_s3_1.default)({
    s3: exports.s3,
    bucket: "tapestry-image-bucket/tapestry/images",
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
        console.log("파일정보(multer.ts)", file);
        cb(null, (0, uuid_1.v4)() + file.originalname);
    },
});
const multerUploadProfile = (0, multer_s3_1.default)({
    s3: exports.s3,
    bucket: "tapestry-image-bucket/tapestry/profile",
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
        console.log("파일정보(multer.ts)", file);
        cb(null, (0, uuid_1.v4)() + file.originalname);
    },
});
exports.uploadImage = (0, multer_1.default)({
    storage: multerUpload,
});
exports.uploadProfile = (0, multer_1.default)({
    storage: multerUploadProfile,
});
