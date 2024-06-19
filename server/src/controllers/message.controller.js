import mongoose, { isValidObjectId, mongo } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchHandler.js";
import { Chat } from "../models/chat.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Message } from "../models/message.model.js";
import { emitSocket } from "../sockets/socket.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFile } from "../utils/deleteFiles.js";
import { UserMessage } from "../models/userMessage.model.js";
import { agenda } from "../agenda/agenda.js";

export const messageAggregation2 = () => {
    return [
        {
            $lookup: {
                from: "messages",
                localField: "messageId",
                foreignField: "_id",
                as: "message",
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
                ],
            },
        },
        {
            $addFields: {
                message: { $first: "$message" },
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
    const unreadPart = existedChat.participants.filter((participantId) => {
        if (participantId.toString() !== req?.user?._id.toString()) {
            return participantId;
        }
    });
    const unreadEntries = unreadPart.map((participantId) => ({
        participantId,
    }));

    const newMessage = await Message.create({
        content: content || "",
        sender: req?.user?._id,
        attachments,
        chat: new mongoose.Types.ObjectId(chatId),
        unread: unreadEntries,
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
            if (participant.toString() === req?.user?._id.toString()) {
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

    const messages = await UserMessage.aggregate([
        {
            $match: {
                participantId: req?.user?._id,
                chatId: new mongoose.Types.ObjectId(chatId),
                isDeleted: false,
            },
        },
        ...messageAggregation2(),
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
    const unreadPart = chatExisted.participants.filter((participantId) => {
        if (participantId.toString() !== req?.user?._id.toString()) {
            return participantId;
        }
    });
    const unreadEntries = unreadPart.map((participantId) => ({
        participantId,
    }));
    const newMessage = await Message.create({
        content,
        attachments,
        isReply: true,
        replyTo: messageId,
        sender: req?.user?._id,
        chat: chatId,
        unread:unreadEntries
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

    chat?.participants?.map(async (participant) => {
        const usermessagesCreate = await UserMessage.create({
            messageId: newMessage?._id,
            participantId: participant,
            chatId,
        });
        if (!usermessagesCreate)
            throw new ApiError(
                400,
                "Something Went Wrong While Creating UserMessage"
            );
    });

    const messagesFind = await UserMessage.findOne({
        messageId: newMessage?._id,
        participantId: req?.user?._id,
    });

    const messages = await UserMessage.aggregate([
        {
            $match: {
                _id: messagesFind?._id,
            },
        },
        ...messageAggregation2(),
    ]);
    console.log("Messagses:", messages);

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
                    console.log("MessageSender", message?.sender);
                    console.log("reqUser", req?.user?._id);
                    console.log(
                        message?.sender.toString() === req?.user?._id.toString()
                    );
                    const messageNew = await Message.create({
                        sender: req.user?._id,
                        content: message.content,
                        chat: chat._id,
                        forwardCount:
                            message.sender.toString() ===
                            req?.user?._id.toString()
                                ? 0
                                : message.forwardCount + 1 || 1,
                        forwardSource:
                            message.sender.toString() ===
                            req?.user?._id.toString()
                                ? undefined
                                : message.forwardSource || message.sender,
                        isForwarded:
                            message.sender.toString() ===
                            req?.user?._id.toString()
                                ? false
                                : true,
                        attachments: message.attachments,
                    });
                    if (!messageNew) {
                        throw new ApiError(
                            400,
                            "Message Not Created Successfully in ForwardMessage"
                        );
                    }
                    chat?.participants?.map(async (participant) => {
                        const usermessagesCreate = await UserMessage.create({
                            messageId: messageNew?._id,
                            participantId: participant,
                            chatId: chat?._id,
                        });
                        if (!usermessagesCreate)
                            throw new ApiError(
                                400,
                                "Something Went Wrong While Creating UserMessage"
                            );
                    });
                    messageId.push(messageNew._id);
                })
            );
        })
    );

    const aggMessage = await UserMessage.aggregate([
        {
            $match: {
                messageId: {
                    $in: messageId,
                },
                participantId: req?.user?._id,
            },
        },
        ...messageAggregation2(),
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
                if (mess?.chatId?.toString() === chat?._id?.toString()) {
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

export const deleteForMe = asyncHandler(async (req, res) => {
    const { userMessageIds } = req.body;
    let chatid = null;
    if (!userMessageIds?.length)
        throw new ApiError(400, "User Message Ids are Required!!");
    try {
        const userMessage = await UserMessage.find({
            _id: {
                $in: userMessageIds,
            },
        });
        chatid = userMessage[0]?.chatId;
        console.log(userMessage);
    } catch (error) {
        throw new ApiError(400, "Invalid Message Id");
    }
    const deletedUserMessage = await UserMessage.deleteMany({
        _id: {
            $in: userMessageIds,
        },
    });

    if (!deletedUserMessage)
        throw new ApiError(
            500,
            "Something Went Wrong While Deleting the user message"
        );

    // const chat = await Chat.findById(chatid);
    // console.log(chat?.participants);

    // chat?.participants?.forEach((participant) => {
    //     if (participant.toString === req?.user?._id.toString()) return;
    //     emitSocket(req, participant, "deleteForMe", userMessageIds);
    // });

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Message Deleted SuccessFully", userMessageIds)
        );
});
export const deleteForEveryone = asyncHandler(async (req, res) => {
    const { messageIds, chatId } = req.body;
    if (!chatId) throw new ApiError(404, "Chat ID Not Found");
    if (!messageIds?.length)
        throw new ApiError(404, "User Message Ids are Required!!");
    try {
        await Message.find({
            _id: {
                $in: messageIds,
            },
        });
    } catch (error) {
        throw new ApiError(400, "Invalid Message Id");
    }
    const chat = await Chat.findById(chatId);
    if (!chat) throw new ApiError(404, "Chat Not Found");
    const updatedMessage = await Message.updateMany(
        {
            _id: {
                $in: messageIds,
            },
        },
        {
            $set: {
                isDeletedBySenderToAll: true,
                deletedAlert: "This Message Was Deleted",
                content: "",
                attachments: [],
            },
        }
    );
    const messageIdsWithObject = messageIds.map(
        (id) => new mongoose.Types.ObjectId(id)
    );
    console.log("ObjectId", messageIdsWithObject);
    const userMessageUpdated = await UserMessage.aggregate([
        {
            $match: {
                messageId: {
                    $in: messageIdsWithObject,
                },
                participantId: req?.user?._id,
            },
        },
        ...messageAggregation2(),
    ]);
    chat.participants.forEach((participant) => {
        if (participant.toString() === req?.user?._id?.toString()) return;
        emitSocket(
            req,
            participant.toString(),
            "deleteForEveryone",
            userMessageUpdated
        );
    });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Message for Everyone Deleted SuccessFully",
                userMessageUpdated
            )
        );
});

export const addReaction = asyncHandler(async (req, res) => {});
export const removeReaction = asyncHandler(async (req, res) => {});

export const scheduleMessage = asyncHandler(async (req, res) => {
    const { content, chatId, delay } = req.body;
    if (!content || !chatId || !delay)
        throw new ApiError(400, "Content,ChatId,Delay Fields are Required");

    const job = await agenda.every(delay, "send scheduled message", {
        content,
        chatId,
        userId: req?.user?._id?.toString(),
    });

    return res
        .status(201)
        .json(new ApiResponse(201, "Message scheduled SuccessFully", job));
});

export const setReadMessage = asyncHandler(async (req, res) => {
    const { messageIds } = req.body;
    if (!messageIds?.length)
        throw new ApiError(400, "MessageIds and ChatId Are Required");
    try {
        await Message.find({
            _id: {
                $in: messageIds,
            },
        });
    } catch (error) {
        throw new ApiError(400, "Invalid MessageIds");
    }
    const userId = new mongoose.Types.ObjectId(req?.user?._id);
    const currentTime = Date.now();

    const messageUpdated = await Promise.all(
        messageIds?.map(async (messageId) => {
            const message = await Message.findById(messageId);
            if (message) {
                const alreadySent = message.read.some((s) =>
                    s.participantId.equals(userId)
                );
                if (!alreadySent) {
                    message.read.push({
                        participantId: userId,
                        time: currentTime,
                    });
                    message.unread = message.unread.filter(
                        (u) => !u.participantId.equals(userId)
                    );
                    return message.save();
                }
            }
        })
    );
    if (!messageUpdated)
        throw new ApiError(
            500,
            "Something went Wrong While Updating the Read message"
        );
    const objConvertedMessageIds = messageIds?.map(
        (id) => new mongoose.Types.ObjectId(id)
    );
    const message = await UserMessage.aggregate([
        {
            $match: {
                participantId: new mongoose.Types.ObjectId(req?.user?._id),
                messageId: {
                    $in: objConvertedMessageIds,
                },
            },
        },
        ...messageAggregation2(),
    ]);
    if (!message.length)
        throw new ApiError(500, "Something Wrong While Fetching Read Messages");

    message.forEach((msg) => {
        emitSocket(
            req,
            msg.message?.sender?._id.toString(),
            "statusMessage",
            msg
        );
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Read Message SuccessFully Updated", message)
        );
});

export const setSentMessage = asyncHandler(async (req, res) => {
    const { messageIds } = req.body;
    if (!messageIds?.length)
        throw new ApiError(400, "MessageIds and ChatId Are Required");
    try {
        await Message.find({
            _id: {
                $in: messageIds,
            },
        });
    } catch (error) {
        throw new ApiError(400, "Invalid MessageIds");
    }
    const userId = new mongoose.Types.ObjectId(req?.user?._id);
    const currentTime = Date.now();

    const messageUpdated = await Promise.all(
        messageIds?.map(async (messageId) => {
            const message = await Message.findById(messageId);
            if (message) {
                const alreadySent = message.sent.some((s) =>
                    s.participantId.equals(userId)
                );
                if (!alreadySent) {
                    message.sent.push({
                        participantId: userId,
                        time: currentTime,
                    });
                    return message.save();
                }
            }
        })
    );
    if (!messageUpdated)
        throw new ApiError(
            500,
            "Something went Wrong While Updating the Read message"
        );
    const objConvertedMessageIds = messageIds?.map(
        (id) => new mongoose.Types.ObjectId(id)
    );
    const message = await UserMessage.aggregate([
        {
            $match: {
                participantId: new mongoose.Types.ObjectId(req?.user?._id),
                messageId: {
                    $in: objConvertedMessageIds,
                },
            },
        },
        ...messageAggregation2(),
    ]);
    if (!message.length)
        throw new ApiError(500, "Something Wrong While Fetching Read Messages");

    message.forEach((msg) => {
        emitSocket(
            req,
            msg.message?.sender?._id.toString(),
            "statusMessage",
            msg
        );
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Read Message SuccessFully Updated", message)
        );
});

export const getUnreadMessages = asyncHandler(async (req, res) => {
    const unreadMessages = await UserMessage.aggregate([
        {
            $match: {
                participantId: req?.user?._id,
            },
        },
        ...messageAggregation2(),
        {
            $match: {
                "message.unread.participantId": req?.user?._id,
            },
        },
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Unread Messages Fetched SuccessFully",
                unreadMessages
            )
        );
});
