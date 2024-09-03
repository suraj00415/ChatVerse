import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode =
            err?.statusCode || err instanceof mongoose.Error ? 400 : 500;
        const message = error?.message || "Something Went Wrong";
        error = new ApiError(statusCode, message, err?.errors, err?.stack);
    }
    
    logger.error(
        JSON.stringify({
            ...error,
            message: error?.message,
            stack: error?.stack,
        })
    );
    return res.status(error?.statusCode).json({
        ...error,
        message: error?.message,
        stack: error?.stack,
    });
};
