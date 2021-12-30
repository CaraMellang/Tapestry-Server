import Mongoose from "mongoose";
import bcript from "bcrypt";

const saltRounds = 8;

export default function userModel() {
  const userSchema = new Mongoose.Schema({
    email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/, //email 패턴이 아니면 저장 X => 수정필요  //이게맞는지 모르겠음..
    },
    password: { type: String, required: true },
    user_name: { type: String },
    user_img: { type: String, default: null },
    created_at: { type: Date, default: null },
    updated_at: { type: Date, default: null },
    provider: { type: String, default: null },
  });

  userSchema.pre("save", async function (next) { //*** 제대로 작동안함!! *** 라이브러리로 감싸주자/
    const user = this; //여기서 this는 저장할 객체의 정보를 담고있음.
    
    if (user.isModified("password")) {
      try {
        const salt =  await bcript.genSalt(saltRounds);
        const hashedpassword = await bcript.hash(user.password,salt)
        user.password = hashedpassword;
        next()
      } catch (err: any) {
        console.log(err);
        return next(err);
      }
    }
    next();
  });

  return Mongoose.model("User", userSchema);
}
