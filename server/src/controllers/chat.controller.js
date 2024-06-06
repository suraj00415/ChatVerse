import { isValidObjectId } from "mongoose";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchHandler.js";
import mongoose from "mongoose";
import { emitSocket } from "../sockets/socket.js";
import { Group } from "../models/group.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { groupAvatarPlaceholder } from "../utils/constants.js";
import { deleteFile } from "../utils/deleteFiles.js";

export const chatAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                localField: "participants",
                foreignField: "_id",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            password: 0,
                            refreshToken: 0,
                            emailVerifyTokenExpiry: 0,
                            forgotPasswordToken: 0,
                            emailVerifyToken: 0,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "admins",
                foreignField: "_id",
                as: "admins",
                pipeline: [
                    {
                        $project: {
                            password: 0,
                            refreshToken: 0,
                            emailVerifyTokenExpiry: 0,
                            forgotPasswordToken: 0,
                            emailVerifyToken: 0,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "messages",
                foreignField: "_id",
                localField: "lastmessage",
                as: "lastmessage",
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
                                        avatar: 1,
                                        email: 1,
                                        name: 1,
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
                lastmessage: { $first: "$lastmessage" },
            },
        },
    ];
};

export const grouChatAggregation = () => {
    return [
        ...chatAggregation(),
        {
            $lookup: {
                from: "groups",
                localField: "Group",
                foreignField: "_id",
                as: "Group",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "groupCreator",
                            foreignField: "_id",
                            as: "groupCreator",
                            pipeline: [
                                {
                                    $project: {
                                        password: 0,
                                        refreshToken: 0,
                                        emailVerifyTokenExpiry: 0,
                                        forgotPasswordToken: 0,
                                        emailVerifyToken: 0,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            groupCreator: {
                                $first: "$groupCreator",
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                Group: {
                    $first: "$Group",
                },
            },
        },
    ];
};

export const createOneToOneChat = asyncHandler(async (req, res) => {
    const { recieverId } = req.params;
    const isValidRecieverId = isValidObjectId(recieverId);
    if (!isValidRecieverId) throw new ApiError(400, "Invalid Reciever Id");

    const reciever = await User.findById(recieverId);
    if (!reciever) throw new ApiError(404, "Reciever Does Not Exits");

    if (recieverId === req.user?._id.toString())
        throw new ApiError(403, "You Cannot Chat With Yourself");

    const existedChat = await Chat.aggregate([
        {
            $match: {
                $and: [
                    {
                        participants: new mongoose.Types.ObjectId(
                            req.user?._id
                        ),
                    },
                    {
                        participants: new mongoose.Types.ObjectId(recieverId),
                    },
                    { isGroup: false },
                    { isCommunity: false },
                ],
            },
        },
        ...chatAggregation(),
    ]);
    console.log("existed Chat:", existedChat);
    if (existedChat.length)
        return res
            .status(200)
            .json(new ApiResponse(200, "Chat Already Existed", existedChat));

    const newChat = await Chat.create({
        name: "oneToOne",
        participants: [req.user?._id, recieverId],
        admins: [req.user?._id],
    });

    const createdChat = await Chat.aggregate([
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(newChat?._id),
                },
            },
            ...chatAggregation(),
        ],
    ]);
    console.log("chat Created:", createdChat);

    if (!createdChat)
        throw new ApiError(
            500,
            "Something Went Wrong While One To One Creating Chat"
        );
    createdChat[0].participants.forEach((participant) => {
        // if (participant?._id === req.user?._id.toString()) return;
        console.log("partis", participant?._id);
        emitSocket(req, participant?._id.toString(), "newChat", createdChat[0]);
    });
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                "One To One Chat Created SuccessFully",
                createdChat
            )
        );
});

export const createGroup = asyncHandler(async (req, res) => {
    const { name, participants, description } = req.body;
    const groupAvatar = req?.file;
    const participantArray = participants?.split(",");
    console.log(participantArray);
    if (!name || !participantArray.length || !description)
        throw new ApiError(
            400,
            "Name , Description and Participants are Required"
        );

    const members = [
        ...new Set([...participantArray, req.user?._id.toString()]),
    ];
    if (members?.length < 3)
        throw new ApiError(403, "Group Should have at least 3 members");

    const isGroupExisted = await Group.aggregate([
        {
            $match: {
                $and: [{ name }, { groupCreator: req?.user?._id }],
            },
        },
    ]);
    if (isGroupExisted.length) throw new ApiError(403, "Group Already Created");

    let groupAvatarUrl = groupAvatarPlaceholder;

    if (groupAvatar && groupAvatar?.path) {
        console.log("insidegroupavatar");
        const response = await uploadOnCloudinary(groupAvatar?.path);
        if (response?.url) groupAvatarUrl = response?.url;
        else
            throw new ApiError(
                500,
                "Something Went Wrong While Uploading On cloudinary"
            );
    }

    const group = await Group.create({
        name,
        groupCreator: req.user?._id,
        avatar: groupAvatarUrl,
        description,
    });
    const groupCreated = await Group.findById(group?._id);
    if (!groupCreated)
        throw new ApiError(500, "Something Went Wrong While Creating Group");

    const newGroupChat = await Chat.create({
        name: "GroupChat",
        admins: [req.user?._id],
        isGroup: true,
        Group: groupCreated?._id,
        participants: members,
    });

    const groupChat = await Chat.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(newGroupChat?._id) },
        },
        ...grouChatAggregation(),
    ]);

    if (!groupChat.length)
        throw new ApiError(
            500,
            "Something Went Wrong While Creating Group Chat"
        );

    members.forEach((id) => {
        if (id == req.user?._id.toString()) return;
        emitSocket(req, id, "newChat", groupChat[0]);
    });
    if (groupAvatar && groupAvatar?.filename) {
        deleteFile(groupAvatar?.filename);
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                "Group Chat Created SuccessFully",
                groupChat[0]
            )
        );
});

export const addNewParticipantsInGroupChat = asyncHandler(async (req, res) => {
    const { participants, chatId } = req.body;
    if (!chatId || !participants.length)
        throw new ApiError(403, "ChatID and Participants are Required");

    if (!isValidObjectId(chatId)) throw new ApiError(400, "Invalid ChatId");

    const members = [...new Set(participants)];
    if (!members.length) throw new ApiError(403, "No Participants are There!");

    members.forEach((id) => {
        if (!isValidObjectId(id))
            throw new ApiError(400, `Invalid Participant Id :${id}`);
    });

    if (members.includes(req.user?._id.toString()))
        throw new ApiError(400, "Admin Cannot Be Participants");

    const groupChat = await Chat.findById(chatId);
    if (!groupChat) throw new ApiError(404, "Group Chat Does Not Exists");

    const admins = groupChat.admins;
    const oldParticipants = groupChat.participants;
    if (!admins.includes(req.user?._id.toString()))
        throw new ApiError(
            401,
            "Unauthorized Access To Add New Participants. Requires Admin Permissions"
        );

    members.forEach((id) => {
        if (oldParticipants.includes(id))
            throw new ApiError(
                400,
                `User Already in Chat Group with ID :${id}`
            );
    });

    groupChat.participants = [...groupChat.participants, ...members];
    groupChat.save({ validateBeforeSave: false });
    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...grouChatAggregation(),
    ]);
    if (!chat.length)
        throw new ApiError(
            500,
            "Something Went Wrong While Adding Participants"
        );
    members.forEach((id) => {
        emitSocket(req, id, "newChat", chat[0]);
    });

    return res
        .status(201)
        .json(new ApiResponse(201, "Participants Added SuccessFully", chat[0]));
});

export const removeParticipantFromGroupChat = asyncHandler(async (req, res) => {
    const { chatId, participants } = req.body;
    if (!chatId || !participants.length)
        throw new ApiError(403, "ChatId And Participants Id are Required");

    if (!isValidObjectId(chatId)) throw new ApiError(400, "Invalid ChatId");

    const members = [...new Set(participants)];
    if (!members.length) throw new ApiError(403, "Participants Id is Required");

    members.forEach((id) => {
        if (!isValidObjectId(id))
            throw new ApiError(400, `Invalid Participant Id :${id}`);
    });
    if (members.includes(req.user?._id.toString()))
        throw new ApiError(
            400,
            "You Cannot Remove Yourself. You Need To Leave the Group !!!"
        );

    const groupChat = await Chat.findById(chatId);
    const admins = groupChat.admins;
    const oldParticipants = groupChat.participants;
    if (!admins.includes(req.user?._id.toString()))
        throw new ApiError(
            401,
            "Unauthorized Access to Remove Participants. Require Admin Permissions"
        );

    const newParticipants = oldParticipants.filter((id) => {
        if (members.includes(id.toString())) return null;
        else return id;
    });
    console.log("New:", newParticipants.length);
    if (newParticipants.length < 3)
        throw new ApiError(
            400,
            "You Need To Delete This Group (Minimum 3 Members are Required !!!)"
        );

    groupChat.participants = newParticipants;
    groupChat.save({ validateBeforeSave: false });

    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...grouChatAggregation(),
    ]);
    if (!chat.length)
        throw new ApiError(
            500,
            "Something Went Wrong While Removing Participants"
        );

    members.forEach((id) => {
        emitSocket(req, id, "leaveChat", chat[0]);
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Participants Removed SuccessFully", chat[0])
        );
});

export const leaveGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) throw new ApiError(400, "ChatId Not Found");

    if (!isValidObjectId(chatId)) throw new ApiError(400, "Invalid ChatId");

    const groupChat = await Chat.findById(chatId);
    if (!groupChat) throw new ApiError(404, "Group Chat Does Not Exits");

    if (!groupChat.participants.includes(req.user?._id))
        throw new ApiError(404, "User Not Present In The Group");
    if (
        groupChat.admins.length === 1 &&
        groupChat.admins.includes(req.user?._id)
    )
        throw new ApiError(
            400,
            "This Group Has Only 1 Admin So You Cannot Leave the Group"
        );
    let updatedGroup;

    if (!groupChat.admins.includes(req.user?._id)) {
        updatedGroup = await Chat.findByIdAndUpdate(chatId, {
            $pull: {
                participants: req.user?._id,
            },
        });
    } else {
        updatedGroup = await Chat.findByIdAndUpdate(chatId, {
            $pull: {
                participants: req.user?._id,
            },
            $pull: {
                admins: req.user?._id,
            },
        });
    }
    if (!updatedGroup)
        throw new ApiError(500, "Something Went Wrong While Leaving The Group");
    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...grouChatAggregation(),
    ]);
    if (!chat.length)
        throw new ApiError(
            500,
            "Something Went Wrong While Leaving the Group Chat"
        );

    emitSocket(req, req.user?._id.toString(), "leaveChat", chat[0]);

    return res
        .status(200)
        .json(new ApiResponse(200, "Leaved Group Chat SuccessFully", chat[0]));
});

export const deleteGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    if (!chatId) throw new ApiError(400, "ChatId is Required");

    if (!isValidObjectId(chatId)) throw new ApiError(403, "Invalid ChatId");

    const groupChat = await Chat.findById(chatId);
    if (!groupChat) throw new ApiError(404, "Chat Group Does note exists");

    if (!groupChat.admins.includes(req.user?._id))
        throw new ApiError(
            401,
            "Unauthorized Access To Delete The Group. Requires Admin Permissions"
        );
    const payload = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...grouChatAggregation(),
    ]);
    const chat = await Chat.findByIdAndDelete(chatId);
    const group = await Group.findByIdAndDelete(groupChat.Group);
    if (!chat || !group)
        throw new ApiError(
            500,
            "Something Went Wrong While Deleting The Group"
        );

    groupChat?.participants?.forEach((id) => {
        emitSocket(req, id.toString(), "leaveChat", payload);
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Group Chat Deleted SuccessFully", payload));
});

export const delteOneToOneChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    if (!chatId) throw new ApiError(400, "ChatId is Required");

    if (!isValidObjectId(chatId)) throw new ApiError(400, "Invalid ChatId");
    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...chatAggregation(),
    ]);
    if (!chat.length) throw new ApiError(404, "Chat Does Not Exists");
    await Chat.findByIdAndDelete(chatId);
    const otherParticipant = chat[0]?.participants?.find((participant) => {
        return req.user?._id.toString() !== participant?._id;
    });

    emitSocket(req, otherParticipant?._id, "leaveChat", chat[0]);

    return res
        .status(200)
        .json(new ApiResponse(200, "One To One Chat Deleted", chat[0]));
});

export const getAllChats = asyncHandler(async (req, res) => {
    const chat = await Chat.aggregate([
        {
            $match: {
                participants: req.user?._id,
            },
        },
        ...grouChatAggregation(),
        {
            $sort: {
                lastmessage: -1,
            },
        },
    ]);

    if (!chat.length) throw new ApiError(400, "No Data To Show");
    return res
        .status(200)
        .json(new ApiResponse(200, "All Chats Fetched SuccessFully", chat));
});

export const searchAvailableUsers = asyncHandler(async (req, res) => {
    let query = " ";
    if (req.params?.query) {
        query = req.params?.query;
    }
    const users = await User.aggregate([
        {
            $match: {
                $and: [
                    {
                        _id: {
                            $ne: req.user._id,
                        },
                    },
                    {
                        $or: [
                            {
                                name: {
                                    $regex: query,
                                    $options: "i",
                                },
                            },
                            {
                                username: {
                                    $regex: query,
                                    $options: "i",
                                },
                            },
                        ],
                    },
                ],
            },
        },
        {
            $project: {
                avatar: 1,
                name: 1,
                username: 1,
                email: 1,
            },
        },
    ]);
    if (!users.length) throw new ApiError(404, "No Users Found");
    return res
        .status(200)
        .json(new ApiResponse(200, "Users fetched successfully", users));
});
