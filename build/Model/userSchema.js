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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltRounds = 8;
function userModel() {
    const userSchema = new mongoose_1.default.Schema({
        email: {
            type: String,
            required: true,
            match: /.+\@.+\..+/,
            default: null,
        },
        password: { type: String, default: null },
        user_name: { type: String, default: null },
        follow: { type: [mongoose_1.default.Types.ObjectId], default: [], ref: "User" },
        group: { type: [mongoose_1.default.Types.ObjectId], default: [], ref: "Group" },
        user_img: { type: String, default: null },
        created_at: { type: Date, default: null },
        updated_at: { type: Date, default: null },
        social_id: { type: String, default: null },
        provider: { type: String, default: "local" },
    });
    userSchema.pre("save", function (next) {
        return __awaiter(this, void 0, void 0, function* () {
            //*** 제대로 작동안할수 있음!! ***
            const user = this; //여기서 this는 저장할 객체의 정보를 담고있음.
            if (user.isModified("password")) {
                try {
                    const salt = yield bcrypt_1.default.genSalt(saltRounds);
                    const hashedpassword = yield bcrypt_1.default.hash(user.password, salt);
                    user.password = hashedpassword;
                    next();
                }
                catch (err) {
                    console.log(err);
                    return next(err);
                }
            }
            next();
        });
    });
    return mongoose_1.default.model("User", userSchema);
}
exports.default = userModel;
