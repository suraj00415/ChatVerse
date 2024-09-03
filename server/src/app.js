import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import { errorHandler } from "./middlewares/error.middleware.js";
import { initializeSocket } from "./sockets/socket.js";
import { agenda } from "./agenda/agenda.js";
import logger from "./utils/logger.js";

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

const morganFormat =
    ":method :url :status :response-time ms :user-agent [:date[clf]]";
app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => {
                const msg = message.split(" ");
                const logObject = {
                    method: msg[0],
                    url: msg[1],
                    status: msg[2],
                    responseTime: msg[3],
                    userAgent: msg[5],
                    date: msg[6],
                };
                logger.http(JSON.stringify(logObject));
            },
        },
    })
);
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
