import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import { errorHandler } from "./middlewares/error.middlewar.js";
import { initializeSocket } from "./sockets/socket.js";
import { agenda } from "./agenda/agenda.js";

const app = express();
export const httpServer = createServer(app);

const io = new Server(httpServer, {
    pingTimeout: 6000,
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
});
app.set("io", io);
agenda.io = io;
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("combined"));
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ limit: "30kb", extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes);

import chatRoutes from "./routes/chat.routes.js";

app.use("/api/v1/chats", chatRoutes);

import groupRoutes from "./routes/group.routes.js";
app.use("/api/v1/groups", groupRoutes);

import messageRoutes from "./routes/message.routes.js";
app.use("/api/v1/messages", messageRoutes);

initializeSocket(io);

app.use(errorHandler);
export default app;
