import dotenv from "dotenv";
import app from "./app.js";
import { httpServer } from "./app.js";
import { port } from "./utils/constants.js";
import connectDB from "./utils/connectDb.js";
import logger from "./utils/logger.js";

dotenv.config({
    path: "../.env",
});

connectDB()
    .then(() => {
        httpServer.listen(port, () => {
            logger.verbose("🙌😀 Server started on port:" + port);
        });
    })
    .catch((err) => {
        logger.error(
            "Some errror Occured while connecting to the database:" + err
        );
    });
