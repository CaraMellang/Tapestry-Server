import Mongoose  from "mongoose";

export default function imageModel(){
    const imageSchema = new Mongoose.Schema({
        image_name:{type:String},
        save_location:{type:String}, // 저장된 버킷위치
        save_path :{type:String}, //버킷에 저장된 경로
        file_size:{type:Number},
        file_type:{type:String} // 비디오 or 이미지, 타입종류는 나중에 바꿀예정

    })

    return Mongoose.model("image",imageSchema)
}