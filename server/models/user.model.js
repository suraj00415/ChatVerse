import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is Required"],
            trim: true,
        },
        username: {
            type: String,
            required: [true, "Username is Required"],
            lowercase: true,
            trim: true,
            unique: [true, "Username Already Exists"],
        },
        password: {
            type: String,
            required: [true, "Password is Required"],
        },
        dob: {
            type: Date,
        },
        avatar: {
            type: String,
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
        forgotPasswordToken: {
            type: String,
            default: null,
        },
        forgotPasswordExpiry: {
            type: String,
            defalult: null,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async (next) => {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.generateRefreshToken = async () => {
    const token = await jwt.sign(
        {
            _id: this._id,
            name: this.name,
            username: this.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
    return token;
};

userSchema.methods.generateAccessToken = async () => {
    const token = await jwt.sign(
        {
            _id: this._id,
            name: this.name,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        }
    );
    return token;
};

userSchema.methods.isPasswordCorrect = (password) => {
    if (this.password == password) return true;
    else return false;
};

userSchema.methods.generateVerifiedEmail = () => {
    const token = crypto.createHash("sha256").update(this.emailVerifyToken).digest("hex");
    return token;
};
export const User = mongoose.model("User", userSchema);