    import express from "express";
    import cors from "cors";
    import cookieParser from "cookie-parser";
    import morgan from "morgan";

    const app = express();

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

    export default app;