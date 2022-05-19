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
const passport_google_oauth20_1 = __importDefault(require("passport-google-oauth20"));
const RootModel_1 = require("../Model/RootModel");
function GooglePassportStrategy(passport) {
    let GoogleStrategy = passport_google_oauth20_1.default.Strategy;
    passport.use("google", new GoogleStrategy({
        clientID: process.env.CLIENT_ID || "",
        clientSecret: process.env.CLIENT_SECRET || "",
        callbackURL: `http://localhost:4000/auth/google/callback`,
    }, (accessToken, refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
        console.log(profile, accessToken);
        const { emails, photos } = profile;
        if (!emails || !photos) {
            done(Error("email or photos not found"));
            return;
        }
        console.log(emails[0].value);
        try {
            let User = yield RootModel_1.UserModel.findOne({
                social_id: profile.id,
                provider: "google",
            });
            if (User === null) {
                let User = new RootModel_1.UserModel({
                    email: emails[0].value,
                    // password: "google",
                    social_id: profile.id,
                    user_name: profile.displayName,
                    user_img: photos[0].value,
                    provider: "google",
                });
                yield User.save();
                done(null, { data: { User, accessToken } });
            }
            done(null, { data: { User, accessToken } });
        }
        catch (err) {
            done(err);
        }
    })));
}
exports.default = GooglePassportStrategy;
