import Agenda from "agenda";
import { emitSocket } from "../sockets/socket.js";
import { Chat } from "../models/chat.model.js";
import { messageAggregation2 } from "../controllers/message.controller.js";
import { Message } from "../models/message.model.js";
import { UserMessage } from "../models/userMessage.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import logger from "../utils/logger.js";

export const agenda = new Agenda({
    db: { address: process.env.MONGODB_URI, collection: "agendaJobs" },
});

agenda.define("send scheduled message", async (job) => {
    const { content, chatId, userId } = job.attrs.data;

    if (!chatId) throw new ApiError(400, "ChatId is required");
    if (!isValidObjectId(chatId)) throw new ApiError(400, "Invalid ChatId");
    const existedChat = await Chat.findById(chatId);
    if (!existedChat) throw new ApiError(404, "Chat Does not exists");

    const newMessage = await Message.create({
        content: content || "",
        sender: userId,
        chat: new mongoose.Types.ObjectId(chatId),
    });

    const chat = await Chat.findOneAndUpdate(
        new mongoose.Types.ObjectId(chatId),
        {
            $set: {
                lastmessage: newMessage?._id,
            },
        },
        { new: true }
    );
    let userMessageId = null;
    const userMessageCreationPromises = existedChat.participants.map(
        async (participant) => {
            const userMessageCreate = await UserMessage.create({
                messageId: newMessage._id,
                participantId: participant,
                chatId: new mongoose.Types.ObjectId(chatId),
            });
            if (participant.toString() === userId?.toString()) {
                userMessageId = userMessageCreate._id;
            }
            if (!userMessageCreate) {
                throw new ApiError(500, "Error creating UserMessage");
            }
        }
    );
    await Promise.all(userMessageCreationPromises);
    const messages = await UserMessage.aggregate([
        {
            $match: {
                _id: userMessageId,
            },
        },
        ...messageAggregation2(),
    ]);
    if (!messages?.length)
        throw new ApiError(
            400,
            "Something Went Wrong While Aggreatating Message"
        );
    existedChat?.participants.forEach((participant) => {
        emitSocket(
            { app: { get: () => agenda.io } },
            participant.toString(),
            "newMessage",
            messages[0]
        );
    });
    logger.debug(
        `Message sent to chat ${chatId} for user ${userId}: ${content}`
    );
    // return res
    //     .status(200)
    //     .json(new ApiResponse(200, "Message Sent SuccessFully", messages[0]));

    // emitSocket(
    //     { app: { get: () => agenda.io } },
    //     chatId,
    //     "newMessage2",
    //     userMessage
    // );
});

(async function () {
    await agenda.start();
})();
