import mongoose, { Schema } from "mongoose";

const reactionSchema = new Schema(
    {
        participantId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        emojiCode: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const statusSchema = new Schema(
    {
        participantId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        time: {
            type: Date,
        },
    },
    { _id: false }
);

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
        isForwarded: {
            type: Boolean,
            default: false,
        },
        forwardSource: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        forwardCount: {
            type: Number,
            default: 0,
        },
        reactions: [reactionSchema],
        isSenderRemoved: {
            type: Boolean,
            default: false,
        },
        isDeletedBySenderToAll: {
            type: Boolean,
            default: false,
        },
        deletedAlert: {
            type: String,
        },
        isMainAlert: {
            type: Boolean,
            default: false,
        },
        alertContent: {
            type: String,
        },
        unread: [statusSchema],
        read: [statusSchema],
        sent: [statusSchema],
    },
    { timestamps: true }
);
messageSchema.pre("save", function (next) {
    this.read.sort((a, b) => b.time - a.time);
    this.sent.sort((a, b) => b.time - a.time);
    next();
});

export const Message = mongoose.model("Message", messageSchema);
