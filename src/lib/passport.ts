import GoogleOauth from "passport-google-oauth20";
// import passport from "passport";
import dotenv from "dotenv";

function GooglePassportStrategy(passport:any) {
  let GoogleStrategy = GoogleOauth.Strategy;

  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID || "",
        clientSecret: process.env.CLIENT_SECRET || "",
        callbackURL: `http://localhost:5000/auth/google/callback`,
      },
      function (accessToken: any, refreshToken: any, profile: any, cb: any) {
        console.log(profile);
        return cb(null, "dd");
      }
    )
  );
}

export default GooglePassportStrategy