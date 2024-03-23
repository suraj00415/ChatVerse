import mongoose, { Schema } from "mongoose";
import { groupAvatarPlaceholder } from "../utils/constants";

const communitySchema = new Schema({
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
    groups: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Group",
        },
    ],
});

export const Community = mongoose.model("Community", communitySchema);