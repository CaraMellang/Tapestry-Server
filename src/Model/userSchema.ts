import Mongoose from "mongoose";
import bcript from "bcrypt";
import { userSchemaAsyncWrap } from "../lib/asyncWrap";

const saltRounds = 8;

export default function userModel() {
  const userSchema = new Mongoose.Schema({
    email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/, //email 패턴이 아니면 저장 X => 수정필요  //이게맞는지 모르겠음..
      default: null,
    },
    password: { type: String, default: null },
    user_name: { type: String, default: null },
    follow: { type: [String], default: [], ref: "User" },
    group: { type: [Mongoose.Types.ObjectId], default: [], ref: "Group" },
    user_img: { type: String, default: null },
    created_at: { type: Date, default: null },
    updated_at: { type: Date, default: null },
    social_id: { type: String, default: null },
    provider: { type: String, default: "local" },
  });

  userSchema.pre("save", async function (next) {
    //*** 제대로 작동안할수 있음!! ***
    const user = this; //여기서 this는 저장할 객체의 정보를 담고있음.

    if (user.isModified("password")) {
      try {
        const salt = await bcript.genSalt(saltRounds);
        const hashedpassword = await bcript.hash(user.password, salt);
        user.password = hashedpassword;
        next();
      } catch (err: any) {
        console.log(err);
        return next(err);
      }
    }
    next();
  });

  return Mongoose.model("User", userSchema);
}
