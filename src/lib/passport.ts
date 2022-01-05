import GoogleOauth from "passport-google-oauth20";
import passport from "passport";
import dotenv from "dotenv";

let GoogleStrategy = GoogleOauth.Strategy;

if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: `http://localhost:5000/auth/google/callback`,
      },
      function (accessToken: any, refreshToken: any, profile: any, cb: any) {}
    )
  );
}
