"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
function imageModel() {
    const imageSchema = new mongoose_1.default.Schema({
        image_name: { type: String },
        save_location: { type: String },
        save_path: { type: String },
        file_size: { type: Number },
        file_type: { type: String } // 비디오 or 이미지, 타입종류는 나중에 바꿀예정
    });
    return mongoose_1.default.model("image", imageSchema);
}
exports.default = imageModel;
