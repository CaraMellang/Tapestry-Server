"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const mongoose_1 = __importDefault(require("mongoose"));
const group_1 = __importDefault(require("./routes/group"));
const post_1 = __importDefault(require("./routes/post"));
const follow_1 = __importDefault(require("./routes/follow"));
const comment_1 = __importDefault(require("./routes/comment"));
const passport_1 = __importDefault(require("./lib/passport"));
const passport_2 = __importDefault(require("passport"));
const search_1 = __importDefault(require("./routes/search"));
const profile_1 = __importDefault(require("./routes/profile"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://d14utnrre6civk.cloudfront.net",
    credentials: true,
}));
// app.use(cookieParser());
//Express 4.x버전부터 body-parser모듈 내장
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(
//   session({
//     name:"session",
//     secret: "key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );
app.use(passport_2.default.initialize());
// app.use(passport.session());
// passport.serializeUser(function(user:any, done) {
//   console.log("serial",user)
//   done(null, user);
// });
// passport.deserializeUser(function(user:any, done) {
//   console.log("deserial",user)
//   done(null, user);
// });
(0, passport_1.default)(passport_2.default);
console.log("ec2 test");
app.get("/", (req, res) => {
    res.send("ec2 테스트용");
});
const mongoUrl = "mongodb://localhost:27017/tapestry";
console.log(mongoUrl);
mongoose_1.default.connect(mongoUrl)
    .then(() => {
    console.log("Connect!!");
})
    .catch((e) => {
    console.log(`Error!`, e);
});
app.use("/auth", auth_1.default);
app.use("/group", group_1.default);
app.use("/post", post_1.default);
app.use("/follow", follow_1.default);
app.use("/comment", comment_1.default);
app.use("/search", search_1.default);
app.use("/profile", profile_1.default);
const port = 4000;
if (process.env.NODE_ENV === "development") {
    app.listen(port, () => {
        console.log(`listening port ${port}`);
    });
}
else {
    const option = {
        ca: fs_1.default.readFileSync(`/etc/letsencrypt/live/mellang.xyz/fullchain.pem`),
        key: fs_1.default.readFileSync(`/etc/letsencrypt/live/mellang.xyz/privkey.pem`),
        cert: fs_1.default.readFileSync(`'/etc/letsencrypt/live/mellang.xyz/cert.pem'`),
    };
    https_1.default.createServer(option, app).listen(port, () => {
        console.log(`apply https and listening port ${port}`);
    });
}
