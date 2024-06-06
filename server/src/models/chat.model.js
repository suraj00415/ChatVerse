import mongoose, { Schema } from "mongoose";
const chatSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        lastmessage: {
            type: mongoose.Schema.ObjectId,
            ref: "Message",
        },
        participants: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        ],
        removedParticipants: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        ],
        admins: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        ],
        isGroup: {
            type: Boolean,
            default: false,
        },
        isCommunity: {
            type: Boolean,
            default: false,
        },
        Group: {
            type: mongoose.Schema.ObjectId,
            ref: "Group",
        },
        Community: {
            type: mongoose.Schema.ObjectId,
            ref: "Community",
        },
    },
    { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
