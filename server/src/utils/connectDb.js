import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URI
        );
        logger.verbose(
            "MongoDB Connected || DB_HOST: " +
                connectionInstance.connection.host
        );
    } catch (error) {
        logger.error("MongoDb Connection Failed:", error);
        process.exit(1);
    }
};

export default connectDB;
