import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchHandler.js";
import { Chat } from "../models/chat.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Message } from "../models/message.model.js";
import { emitSocket } from "../sockets/socket.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFile } from "../utils/deleteFiles.js";

export const messageAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "sender",
                as: "sender",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1,
                            color: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                sender: { $first: "$sender" },
            },
        },
        {
            $lookup: {
                from: "messages",
                localField: "replyTo",
                foreignField: "_id",
                as: "replyTo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "sender",
                            as: "sender",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        email: 1,
                                        avatar: 1,
                                        color: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            sender: { $first: "$sender" },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                replyTo: {
                    $first: "$replyTo",
                },
            },
        },
    ];
};

export const sendMessage = asyncHandler(async (req, res) => {
    const { chatId, content } = req.body;
    console.log(req.files?.attachments);
    console.log(req?.files);
    if (!content && !req.files?.attachments?.length)
        throw new ApiError(400, "Content or attachments are required");
    if (!chatId) throw new ApiError(400, "ChatId is required");
    if (!isValidObjectId(chatId)) throw new ApiError(400, "Invalid ChatId");
    const existedChat = await Chat.findById(chatId);
    if (!existedChat) throw new ApiError(404, "Chat Does not exists");
    let attachments = [];
    let attachmentsFileName = [];
    if (req.files && req.files?.attachments?.length > 0) {
        const uploadPromises = req.files.attachments.map(async (attach) => {
            const uploaded = await uploadOnCloudinary(attach?.path);
            if (!uploaded) {
                throw new ApiError(
                    500,
                    "Something went wrong while uploading attachments on cloudinary"
                );
            }
            attachments.push(uploaded.url);
            attachmentsFileName.push(attach.filename);
        });

        await Promise.all(uploadPromises);
    }

    const newMessage = await Message.create({
        content: content || "",
        sender: req?.user?._id,
        attachments,
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

    const messages = await Message.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(newMessage?._id),
            },
        },
        ...messageAggregation(),
    ]);

    existedChat?.participants.forEach((participant) => {
        if (participant.toString() === req.user?._id.toString()) return;
        emitSocket(req, participant.toString(), "newMessage", messages[0]);
    });
    attachmentsFileName.map((path) => {
        deleteFile(path);
    });
    return res
        .status(200)
        .json(new ApiResponse(200, "Message Sent SuccessFully", messages[0]));
});

export const getAllMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const existedChat = await Chat.findById(chatId);

    if (!existedChat) {
        throw new ApiError(404, "Chat does not exist");
    }

    // Only send messages if the logged in user is a part of the chat he is requesting messages of
    if (!existedChat.participants?.includes(req.user?._id)) {
        throw new ApiError(400, "User is not a part of this chat");
    }

    const messages = await Message.aggregate([
        {
            $match: {
                chat: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...messageAggregation(),
        {
            $sort: {
                createdAt: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                messages || [],
                "Messages fetched successfully"
            )
        );
});

export const sendReplyMessage = asyncHandler(async (req, res) => {
    const { chatId, messageId, content } = req.body;
    if (!chatId || !messageId)
        throw new ApiError(400, "ChatId or MessageId  is Required");
    if (!isValidObjectId(chatId)) throw new ApiError(400, "Invalid ChatID");

    if (!isValidObjectId(messageId))
        throw new ApiError(400, "Invalid MessageID");
    console.log(req?.files);

    if (!content && !req.files?.attachments.length)
        throw new ApiError(400, "Content or Attachements is required");
    const chatExisted = await Chat.findById(chatId);
    if (!chatExisted) throw new ApiError(404, "Chat Does Not Exists");

    const messageExisted = await Message.findById(messageId);
    if (!messageExisted) throw new ApiError(404, "Message Does Not Exists");

    let attachments = [];
    let attachmentsFileName = [];
    if (req.files && req.files?.attachments?.length > 0) {
        const uploadPromises = req.files.attachments.map(async (attach) => {
            const uploaded = await uploadOnCloudinary(attach?.path);
            if (!uploaded) {
                throw new ApiError(
                    500,
                    "Something went wrong while uploading attachments on cloudinary"
                );
            }
            attachments.push(uploaded.url);
            attachmentsFileName.push(attach.filename);
        });
        await Promise.all(uploadPromises);
    }

    const newMessage = await Message.create({
        content,
        attachments,
        isReply: true,
        replyTo: messageId,
        sender: req?.user?._id,
        chat: chatId,
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

    const messages = await Message.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(newMessage?._id),
            },
        },
        ...messageAggregation(),
    ]);

    chatExisted?.participants.forEach((participant) => {
        if (participant.toString() === req.user?._id.toString()) return;
        emitSocket(req, participant.toString(), "newMessage", messages[0]);
    });
    attachmentsFileName.map((path) => {
        deleteFile(path);
    });
    return res
        .status(200)
        .json(new ApiResponse(200, "Message Sent SuccessFully", messages[0]));
});

export const forwardMessage = asyncHandler(async (req, res) => {
    const messageIds = req.body?.messageIds;
    const chatIds = req.body?.chatIds;
    let chats = [];
    try {
        chats = await Chat.find({
            _id: {
                $in: chatIds,
            },
        });
    } catch (error) {
        throw new ApiError(400, "Invalid ChatID");
    }
    if (!chats.length) throw new ApiError(404, "Chats Does Not Exists");
    if (chats.length > 5)
        throw new ApiError(
            400,
            "You can Forward Messages to only 5 groups/chats at a time ."
        );

    let messagesExisted = [];
    try {
        messagesExisted = await Message.find({
            _id: {
                $in: messageIds,
            },
        });
    } catch (error) {
        throw new ApiError(400, "Invalid Message Ids" || error);
    }

    if (!messagesExisted.length)
        throw new ApiError(404, "Messages Does Not Exists");
    let messageId = [];

    await Promise.all(
        chats.map(async (chat) => {
            await Promise.all(
                messagesExisted.map(async (message) => {
                    const messageNew = await Message.create({
                        sender: req.user?._id,
                        content: message.content,
                        chat: chat._id,
                        forwardCount: message.forwardCount + 1 || 1,
                        forwardSource: message.forwardSource || message.sender,
                        isForwarded: true,
                        attachments: message.attachments,
                    });
                    if (!messageNew) {
                        throw new ApiError(
                            400,
                            "Message Not Created Successfully in ForwardMessage"
                        );
                    }
                    messageId.push(messageNew._id);
                })
            );
        })
    );

    console.log(messageId);
    const aggMessage = await Message.aggregate([
        {
            $match: {
                _id: {
                    $in: messageId,
                },
            },
        },
        ...messageAggregation(),
    ]);
    if (!aggMessage.length)
        throw new ApiError(
            400,
            "Error While Finding Message in the aggregate "
        );
    chats.forEach((chat) => {
        chat.participants.forEach((parrticipantId) => {
            if (parrticipantId.toString() === req.user?._id?.toString()) return;
            aggMessage.forEach((mess, i) => {
                console.log("Mess Chat", mess?.chat);
                console.log("chats?._id.toString()", chats?._id?.toString());
                if (mess?.chat.toString() === chat?._id?.toString()) {
                    emitSocket(
                        req,
                        parrticipantId.toString(),
                        "newMessage",
                        mess
                    );
                }
            });
        });
    });

    return res.status(200).json(new ApiResponse(200, "fetched", aggMessage));
});

export const forwardBulkMessage = asyncHandler(async (req, res) => {});
export const deleteBulkMessage = asyncHandler(async (req, res) => {});
