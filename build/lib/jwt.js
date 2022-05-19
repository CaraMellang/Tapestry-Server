"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); //.env 사용
const secret = process.env.SECRET;
exports.default = {
    sign: (user) => {
        return jsonwebtoken_1.default.sign(user, secret, {
            algorithm: "HS256",
            expiresIn: "1h",
        });
    },
    verify: (token) => {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            return {
                status: true,
                decoded,
            };
        }
        catch (err) {
            return {
                status: false,
                message: "decode failed",
                err: err.message,
            };
        }
    },
};
