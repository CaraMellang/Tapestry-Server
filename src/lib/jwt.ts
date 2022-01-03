import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(); //.env 사용

const secret: any = process.env.SECRET;

export default {
  sign: (user: { email: string; username: string }) => {
    return Jwt.sign(user, secret, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
  },
  verify: (token: string) => {
    try {
      const decoded = Jwt.verify(token,secret);
      return {
        status: true,
        decoded,
      };
    } catch (err: any) {
      return {
        status: false,
        message: "decode failed",
        err: err.message,
      };
    }
  },
};
