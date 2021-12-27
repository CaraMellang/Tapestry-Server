import Mongoose from "mongoose";

export const userSchema = new Mongoose.Schema({
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
