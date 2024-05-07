import { Router } from "express";
import {
    forwardMessage,
    getAllMessages,
    sendMessage,
    sendReplyMessage,
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router
    .route("/send-message")
    .post(
        upload.fields([{ name: "attachments", maxCount: 10 }]),
        verifyJWT,
        sendMessage
    );

router.route("/get-message/:chatId").get(verifyJWT, getAllMessages);

router.route("/forward-message").post(verifyJWT, forwardMessage);

router
    .route("/reply-message")
    .post(
        upload.fields([{ name: "attachments", maxCount: 10 }]),
        verifyJWT,
        sendReplyMessage
    );
export default router;
