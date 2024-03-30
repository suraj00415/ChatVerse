import mongoose, { Schema } from "mongoose";
import { groupAvatarPlaceholder } from "../utils/constants.js";

const groupSchema = new Schema({
    name: {
        type: String,
        default: "Group",
    },
    avatar: {
        type: String,
        default: groupAvatarPlaceholder,
    },
    coverImage: {
        type: String,
    },
    description: {
        type: String,
    },
    links: [String],

    groupCreator: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
});

export const Group = mongoose.model("Group", groupSchema);
