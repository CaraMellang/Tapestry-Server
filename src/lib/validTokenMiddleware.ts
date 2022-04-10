import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import jwt from "./jwt";

export default function validTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authToken = req.headers;
  console.log("ㅎㅇㅎㅇㅎㅇ", authToken);
  if (!authToken["cookie"]) {
    return res.status(401).send({ status: 401, message: "Unauthorized Token" });
  }
  const token = authToken["cookie"].split(`=`)[1];
  console.log("낄낄", token);
  const verifyToken: any = jwt.verify(token);

  if (verifyToken.status) {
    res.locals.user = {
      email: verifyToken.decoded.email,
    };
    console.log(res.locals.user);
    next();
  } else {
    return res.status(401).send({
      status: 401,
      message: "Unauthorized Token",
      err: verifyToken.err,
    });
  }
}
