import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { isBlackOrWhite } from "../utils/constants.js";


const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is Required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is Required"],
        },
        username: {
            type: String,
            required: [true, "Username is Required"],
            lowercase: true,
            trim: true,
            unique: [true, "Username Already Exists"],
            index: true,
        },
        password: {
            type: String,
            required: [true, "Password is Required"],
        },
        avatar: {
            type: String,
            default:
                "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1711037106~exp=1711037706~hmac=ab8ae30120b2a313e5333846fd30bf1de1cb3cb861b07153e295f4765b471b3d",
        },
        coverImage: {
            type: String,
            default:
                "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1711037106~exp=1711037706~hmac=ab8ae30120b2a313e5333846fd30bf1de1cb3cb861b07153e295f4765b471b3d",
        },
        about: {
            type: String,
        },
        links: [String],
        isVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
            default: null,
        },
        emailVerifyToken: {
            type: String,
            default: null,
        },
        emailVerifyTokenExpiry: {
            type: Date,
        },
        forgotPasswordToken: {
            type: String,
            default: null,
        },
        forgotPasswordExpiry: {
            type: Date,
        },
        color: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.generateUserColors = function () {
    var letters = "0123456789ABCDEF";
    var color = "#";
    do {
        color = "#";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
    } while (isBlackOrWhite(color));
    return color;
};

userSchema.methods.generateRefreshToken = async function () {
    const token = await jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
    return token;
};

userSchema.methods.generateAccessToken = async function () {
    const token = await jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
    return token;
};

userSchema.methods.isPasswordCorrect = async function (password) {
    const isCorrect = await bcrypt.compare(password, this.password);
    return isCorrect;
};

userSchema.methods.generateVerifyEmailToken = function () {
    const unHashedToken = crypto.randomBytes(30).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");

    const tokenExpiry =
        Number(Date.now()) + Number(process.env.VERIFY_EMAIL_TOKEN_EXPIRY);
    return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
