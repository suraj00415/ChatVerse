import mongoose, { Schema } from "mongoose";
const userMessageSchema = new Schema(
    {
        participantId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        messageId: {
            type: mongoose.Schema.ObjectId,
            ref: "Message",
            required: true,
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

userMessageSchema.index({ participantId: 1 });
userMessageSchema.index({ messageId: 1 });

export const UserMessage = mongoose.model("UserMessage", userMessageSchema);
