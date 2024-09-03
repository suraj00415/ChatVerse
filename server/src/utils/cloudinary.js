import { v2 as cloudinary } from "cloudinary";
import logger from "./logger.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });
        logger.info("Files Uploaded on Cloudinary", response?.url);
        return response;
    } catch (error) {
        logger.error(error);
        return null;
    }
};
