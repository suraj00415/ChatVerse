import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
        },
        chat: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
        },
        attachments: {
            type: [String],
            default: [],
        },
        isReply: {
            type: Boolean,
            default: false,
        },
        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    },
    { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
