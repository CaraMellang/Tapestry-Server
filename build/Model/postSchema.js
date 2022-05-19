"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
function postModel() {
    const postSchema = new mongoose_1.default.Schema({
        group_id: {
            type: mongoose_1.default.Types.ObjectId,
            required: true,
            ref: "Group",
        },
        owner_id: {
            type: mongoose_1.default.Types.ObjectId,
            required: true,
            ref: "User",
        },
        is_private: { type: Boolean, default: false },
        text: { type: String, default: "" },
        comment: { type: [mongoose_1.default.Types.ObjectId], default: [], ref: "ParantComment" },
        images: { type: Array, default: [] },
        views: { type: Number, default: 0 },
        like_count: { type: Number, default: 0 },
        like_user: { type: [mongoose_1.default.Types.ObjectId], default: [], ref: "User" },
        created_at: { type: Date, default: null },
        updated_at: { type: Date, default: null },
    });
    return mongoose_1.default.model("Post", postSchema);
}
exports.default = postModel;
