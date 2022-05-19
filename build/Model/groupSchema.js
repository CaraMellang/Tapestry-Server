"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
function groupModel() {
    const groupSchema = new mongoose_1.default.Schema({
        owner_id: {
            type: mongoose_1.default.Types.ObjectId,
            required: true,
            ref: "User",
        },
        group_name: { type: String, default: "" },
        group_description: { type: String, default: "" },
        group_img: { type: String, default: "" },
        group_people_count: { type: Number, default: 1 },
        group_peoples: {
            type: [mongoose_1.default.Types.ObjectId],
            default: [],
            ref: "User",
        },
        created_at: { type: Date, default: null },
        updated_at: { type: Date, default: null },
    });
    return mongoose_1.default.model("Group", groupSchema);
}
exports.default = groupModel;
