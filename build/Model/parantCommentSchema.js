"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
function parantCommentModel() {
    const parantCommentSchema = new mongoose_1.default.Schema({
        post_id: {
            type: mongoose_1.default.Types.ObjectId,
            required: true,
            ref: "Post",
        },
        owner_id: {
            type: mongoose_1.default.Types.ObjectId,
            required: true,
            ref: "User",
        },
        text: { type: String, required: true },
        child_comment: {
            type: [mongoose_1.default.Types.ObjectId],
            default: [],
            ref: "ChildComment",
        },
        like_count: { type: Number, default: 0 },
        created_at: { type: Date, default: null },
        updated_at: { type: Date, default: null },
    });
    return mongoose_1.default.model("ParantComment", parantCommentSchema);
}
exports.default = parantCommentModel;
