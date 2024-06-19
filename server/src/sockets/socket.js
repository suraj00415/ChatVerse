import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export const initializeSocket = async (io) => {
    return io.on("connection", async (socket) => {
        try {
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

            logger.info(
                "User Connected 👌 ",
                socket.id + " " + socket?.user?.name
            );

            socket.join(user?._id.toString());
            socket.emit("connected");

            // joining the user to the chat room
            socket.on("joinUser", (chatId) => {
                console.log("User joined the Room :", chatId);
                socket.join(chatId);
            });

            // start typing
            socket.on("startTyping", (chatId) => {
                socket.in(chatId).emit("emitStartTyping", {
                    chatId,
                    _id: socket?.user?._id,
                    user: socket?.user,
                });
            });

            // stop typing
            socket.on("stopTyping", (chatId) => {
                socket.in(chatId).emit("emitStopTyping", {
                    chatId,
                    _id: socket?.user?._id,
                    user: socket?.user,
                });
            });

            // disconnecting the user
            socket.on("disconnect", () => {
                logger.info(
                    "User Disconnected ⚠️ ",
                    socket.id + " ⚠️  " + socket?.user?.name
                );
                if (socket?.user?._id) socket.leave(socket?.user?._id);
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

export const emitSocket = (req, chatId, eventName, payload) => {
    logger.info("socket-chat-new emited :"+ eventName);
    req.app.get("io").in(chatId).emit(eventName, payload);
    logger.info("socket-chat-new completed :"+ eventName);

};
