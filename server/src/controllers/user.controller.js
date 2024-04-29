import crypto from "crypto";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { LogoutOption, option } from "../utils/constants.js";
import { deleteFile } from "../utils/deleteFiles.js";
import { sendVerificationMail } from "../utils/Mails.js";
import jwt from "jsonwebtoken";

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
        $or: [{ username }],
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
    const { unHashedToken, hashedToken, tokenExpiry } =
        newUser.generateVerifyEmailToken();
    const color = newUser.generateUserColors();
    newUser.emailVerifyToken = hashedToken;
    newUser.emailVerifyTokenExpiry = tokenExpiry;
    newUser.color = color;
    await newUser.save({ validateBeforeSave: false });
    const userCreated = await User.findById(newUser?._id).select(
        "-password -refreshToken"
    );

    if (!userCreated) throw new ApiError(400, "Error While Creating the User");

    sendVerificationMail(userCreated, unHashedToken);
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

export const verfiyEmail = asyncHandler(async (req, res) => {
    const verifyEmailUnhashedToken = req.body.emailtoken;

    const hashedToken = crypto
        .createHash("sha256")
        .update(verifyEmailUnhashedToken)
        .digest("hex");

    const user = await User.findById(req.user?._id);

    if (user?.isVerified)
        return res
            .status(200)
            .json(new ApiResponse(202, "User Already Verified", []));

    if (user?.emailVerifyToken !== hashedToken)
        throw new ApiError(401, "Invalid Email Verification Token");
    if (Date.now() > user.emailVerifyTokenExpiry)
        throw new ApiError(403, "Email Verification Token Expired");

    user.isVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpiry = undefined;
    user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, "Email Verified SuccessFully", user));
});

export const resendVerifyEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(404, "User Does Not Exists");
    if (user.isVerified) throw new ApiError(409, "User is Already Verified");
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateVerifyEmailToken();

    user.emailVerifyToken = hashedToken;
    user.emailVerifyTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    sendVerificationMail(user, unHashedToken);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Resended Email Verification Email SuccessFully",
                {}
            )
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(404, "User Does Not Exists");

    user.refreshToken = undefined;
    user.save({ validateBeforeSave: false });

    return res
        .clearCookie("accessToken", LogoutOption)
        .clearCookie("refreshToken", LogoutOption)
        .status(200)
        .json(new ApiResponse(200, "User Logged Out SuccessFully", {}));
});

export const updateAvatar = asyncHandler(async (req, res) => {
    const avatarFileMulter = req.file;
    if (!avatarFileMulter) throw new ApiError(400, "Avatar File Is Required");

    const avatarFile = avatarFileMulter?.filename;

    if (!avatarFile) throw new ApiError(400, "File Name Not Found");
    const avatarPath = avatarFileMulter?.path;
    if (!avatarPath) throw new ApiError(400, "Avatar Path Not Found");

    const data = await uploadOnCloudinary(avatarPath);
    const user = await User.findById(req.user?._id.toString());
    if (!data?.url)
        throw new ApiError(
            500,
            "Something Went Wrong While Updating The avatar file on cloudinary"
        );
    user.avatar = data.url;
    user.save({ validateBeforeSave: false });
    deleteFile(avatarFile);
    return res.json(new ApiResponse(200, "Avatar Updated SuccessFully", user));
});

export const refreshToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken)
            throw new ApiError(401, "Unauthorized Access");
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if (!user) throw new ApiError(400, "Invalid Refresh Token");

        if (incomingRefreshToken == !user.refreshToken)
            throw new ApiError(400, "Refresh Token is Expired or Used");

        const { refreshToken: newRefreshToken, accessToken } =
            await generateAccessRefreshToken(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(
                new ApiResponse(200, "Access Token Refreshed", {
                    accessToken,
                    refreshToken: newRefreshToken,
                })
            );
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Refresh Token");
    }
});
