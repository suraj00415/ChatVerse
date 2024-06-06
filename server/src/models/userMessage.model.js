import mongoose, { Schema } from "mongoose";
const userMessageSchema = new Schema(
    {
        participantId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            require: true,
        },
        messageId: {
            type: mongoose.Schema.ObjectId,
            ref: "Message",
            require: true,
        },
        chatId: {
            type: mongoose.Schema.ObjectId,
            ref: "Chat",
        },
        isAlert: {
            type: Boolean,
            default: false,
        },
        alertMessage: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const UserMessage = mongoose.model("UserMessage", userMessageSchema);
