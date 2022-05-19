"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = __importDefault(require("./jwt"));
function validTokenMiddleware(req, res, next) {
    const authToken = req.headers;
    console.log("ㅎㅇㅎㅇㅎㅇ", authToken);
    if (!authToken["cookie"]) {
        return res.status(401).send({ status: 401, message: "Unauthorized Token" });
    }
    const token = authToken["cookie"].split(`=`)[1];
    console.log("낄낄", token);
    const verifyToken = jwt_1.default.verify(token);
    if (verifyToken.status) {
        res.locals.user = {
            email: verifyToken.decoded.email,
        };
        console.log(res.locals.user);
        next();
    }
    else {
        return res.status(401).send({
            status: 401,
            message: "Unauthorized Token",
            err: verifyToken.err,
        });
    }
}
exports.default = validTokenMiddleware;
