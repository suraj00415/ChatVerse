import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./sockets/socket.js";

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

initializeSocket(io);
export default app;
