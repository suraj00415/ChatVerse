import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import mongoose from "mongoose";
import { grouChatAggregation } from "./chat.controller.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Group } from "../models/group.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFile } from "../utils/deleteFiles.js";

export const getGroupChatDetails = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    if (!chatId) throw new ApiError(403, "Chat Id is Required");

    if (!isValidObjectId(chatId)) throw new ApiError(403, "Invalid Chat ID");

    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...grouChatAggregation(),
    ]);
    if (!chat.length) throw new ApiError(404, "Chat Does Not Exists");
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Group Details Fetched SuccessFully", chat[0])
        );
});

export const renameGroupChat = asyncHandler(async (req, res) => {
    const { name, chatId } = req.body;
    if (!name || !chatId)
        throw new ApiError(403, "Name and ChatId Is Required");
    if (!isValidObjectId(chatId)) throw new ApiError(403, "Invalid Chat Id");
    const chat = await Chat.findById(chatId);
    if (!chat.admins.includes(req.user?._id))
        throw new ApiError(
            401,
            "Unauthorized Access To Change The Group Name "
        );
    const updatedGroup = await Group.findByIdAndUpdate(chat.Group.toString(), {
        name,
    });
    if (!updatedGroup)
        throw new ApiError(
            500,
            "Something went Wrong while Renaming the Group"
        );
    const updatedChat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...grouChatAggregation(),
    ]);
    if (!updatedChat.length)
        throw new ApiError(
            500,
            "Something went wrong while fetching the updated chat"
        );

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Group Renamed SuccessFully", updatedChat[0])
        );
});

export const addAdmins = asyncHandler(async (req, res) => {
    let { admins, chatId } = req.body;
    if (!admins || !chatId)
        throw new ApiError(400, "Admins or ChatId is Required");

    const existedChat = await Chat.findById(chatId);
    if (!existedChat) throw new ApiError(404, "Chat Does Not Exists");
    if (!existedChat.admins.includes(req.user?._id))
        throw new ApiError(401, "Unauthorized Access To Add Admins");

    const chatAdmin = existedChat.admins;
    const chatParticipants = existedChat.participants;

    admins?.forEach((id) => {
        if (!chatParticipants.includes(new mongoose.Types.ObjectId(id)))
            throw new ApiError(400, "User is Not Participant of the group");
    });
    admins?.forEach((id) => {
        if (chatAdmin.includes(new mongoose.Types.ObjectId(id)))
            throw new ApiError(400, "Admin Already Existed in the group");
    });
    admins = admins?.map((id) => new mongoose.Types.ObjectId(id));

    const newAdminList = new Set([...chatAdmin, ...admins]);
    console.log(newAdminList);
    existedChat.admins = Array.from(newAdminList);
    existedChat.save({ validateBeforeSave: false });
    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...grouChatAggregation(),
    ]);
    
    if (!chat) throw new ApiError(400, "Chat Not Found");
    return res
        .status(200)
        .json(new ApiResponse(200, "Admins Added SuccessFully", chat[0]));
});

export const updateGroupAvatar = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const groupFile = req.file;
    if (!chatId || !groupFile)
        throw new ApiError(400, "ChatId or AvatarFile is required");

    if (!isValidObjectId(chatId)) throw new ApiError(400, "Invalid ChatId");
    const existedChat = await Chat.findById(chatId);
    const admins = existedChat.admins;
    if (!admins.includes(req.user?._id))
        throw new ApiError(401, "Unauthorized To Update The Group Icon");

    if (!existedChat) throw new ApiError(404, "Chat Does Not Exists ");

    const groupFileName = req.file?.filename;
    const groupFilePath = req.file?.path;

    const groupId = existedChat?.Group;
    if (!groupId) throw new ApiError(404, "Group Id Does Not Exists");
    const group = await Group.findById(groupId.toString());
    const data = await uploadOnCloudinary(groupFilePath);
    if (!data)
        throw new ApiError(
            500,
            "Something Went Wrong While Uploading On Cloudinary"
        );

    group.avatar = data.url;
    group.save({ validateBeforeSave: false });
    deleteFile(groupFileName);
    const chat = await Chat.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(chatId),
            },
        },
        ...grouChatAggregation(),
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200, "Group Chat Aggregated", chat[0]));
});