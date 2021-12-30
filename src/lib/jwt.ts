import Jwt from "jsonwebtoken";

const secret: any = process.env.SECRET;

export default {
  sign: (user: { email: string; name: string }) => {
    Jwt.sign(user, secret, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
  },
  verify: (token: string) => {
    const decoded = Jwt.decode(token);
    return {
      status: "ok",
      decoded,
    };
  },
};
