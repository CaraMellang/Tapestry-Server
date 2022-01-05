import GoogleOauth, { Profile } from "passport-google-oauth20";
// import passport from "passport";
import dotenv from "dotenv";
import { PassportStatic } from "passport";
import { UserModel } from "../Model/RootModel";

function GooglePassportStrategy(passport: PassportStatic) {
  let GoogleStrategy = GoogleOauth.Strategy;

  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID || "",
        clientSecret: process.env.CLIENT_SECRET || "",
        callbackURL: `http://localhost:5000/auth/google/callback`,
      },
      async (accessToken:string, refreshToken:string, profile: Profile, done) => {
        console.log(profile, accessToken);
        const { emails , photos } = profile;
        if (!emails || !photos) {
          done(Error("email or photos not found"));
          return;
        }
        console.log(emails[0].value);
        try {
          let User = await UserModel.findOne({
            social_id: profile.id,
            provider: "google",
          });
          if (User === null) {
            let User = new UserModel({
              email: emails[0].value,
              password: "google",
              social_id: profile.id,
              user_name: profile.displayName,
              user_img: photos[0].value,
              provider: "google",
            });
            await User.save();
            done(null, {data:{User, accessToken}});
          }
          done(null, {data:{User, accessToken}});
        } catch (err: any) {
          done(err);
        }
      }
    )
  );
}

export default GooglePassportStrategy;
