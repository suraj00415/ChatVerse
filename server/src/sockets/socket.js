import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const initializeSocket = async (io) => {
    return io.on("connection", async (socket) => {
        try {
            console.log("User Connected", socket.id);
            const token = socket.handshake.headers?.token;
            if (!token) throw new ApiError(401, "Unauthorized Access");
            const decodedToken = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            );
            const user = await User.findById(decodedToken?._id).select(
                "-password -emailVerifyToken -emailVerifyTokenExpiry -refreshToken"
            );
            if (!user) throw new ApiError(404, "User Does Not Exists");
            socket.user = user;
            socket.on("joinUser", (message) => {
                console.log(message, socket.id);
            });
            socket.on("disconnect", () => {
                console.log("User Disconnected", socket.id + socket.user.name);
            });
        } catch (error) {
            socket.emit(
                "socketError",
                error?.message ||
                    "Something went wrong while connecting to the socket."
            );
        }
    });
};

