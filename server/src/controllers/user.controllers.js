import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFile } from "../utils/deleteFiles.js";
import { option } from "../utils/constants.js";

const generateAccessRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        const refreshToken = await user.generateRefreshToken();
        const accessToken = await user.generateAccessToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

export const regeisterUser = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password)
        throw new ApiError(400, "Required Fields is not filled");

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser)
        throw new ApiError(409, "User with same username Already Exists");

    if (
        !req.files ||
        !Array.isArray(req.files?.avatar) ||
        !req.files?.avatar[0]?.path
    )
        throw new ApiError(400, "Avatar File is Required");

    const avatarFilePath = req.files?.avatar[0]?.path;
    const avatarFileName = req.files?.avatar[0].filename;
    let coverImageFilePath = "";
    let coverImageFileName = "";
    if (
        req.files &&
        Array.isArray(req.files?.coverImage) &&
        req.files?.coverImage[0]
    ) {
        coverImageFilePath = req.files?.coverImage[0].path;
        coverImageFileName = req.files?.coverImage[0].filename;
    }

    const avatar = await uploadOnCloudinary(avatarFilePath);
    const coverImage = await uploadOnCloudinary(coverImageFilePath);
    if (!avatar)
        throw new ApiError(
            400,
            "Error while uploading Avatar File to Cloudinary"
        );
    if (!coverImage && coverImageFilePath?.trim() !== "")
        throw new ApiError(
            400,
            "Error while uploading coverimage file to cloudinary"
        );

    const avatarURL = avatar?.url;
    const coverImageURL = coverImage?.url;

    const newUser = await User.create({
        name,
        username,
        email,
        password,
        avatar: avatarURL,
        coverImage: coverImageURL,
    });

    const userCreated = await User.findById(newUser?._id).select(
        "-password -refreshToken"
    );

    if (!userCreated) throw new ApiError(400, "Error While Creating the User");

    deleteFile(avatarFileName);
    if (coverImageFileName.trim() !== "") {
        deleteFile(coverImageFileName);
    }

    return res
        .status(200)
        .json(new ApiResponse(201, "User Created SuccessFully", userCreated));
});

export const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username && !password)
        throw new ApiError(401, "Username and Password is Required");

    const userExists = await User.findOne({ username });

    if (!userExists) throw new ApiError(401, "User Does Not Exists");
    const isPassCorrect = await userExists.isPasswordCorrect(password);
    if (!isPassCorrect) throw new ApiError(401, "Incorrect credentials");

    const { accessToken, refreshToken } = await generateAccessRefreshToken(
        userExists?._id
    );

    const loggedInUser = await User.findById(userExists?._id).select(
        "-password "
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(200, "User LoggedIn Successfully", {
                user: loggedInUser,
                accessToken,
                refreshToken,
            })
        );
});


