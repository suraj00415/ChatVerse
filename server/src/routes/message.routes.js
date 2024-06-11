import { Router } from "express";
import {
    deleteForEveryone,
    deleteForMe,
    forwardMessage,
    getAllMessages,
    getUnreadMessages,
    scheduleMessage,
    sendMessage,
    sendReplyMessage,
    setReadMessage,
    setSentMessage,
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/get-message/:chatId").get(verifyJWT, getAllMessages);
router.route("/get-unread-messages").get(verifyJWT, getUnreadMessages);

router.route("/forward-message").post(verifyJWT, forwardMessage);
router.route("/schedule-message").post(verifyJWT, scheduleMessage);
router.route("/set-read-message").post(verifyJWT, setReadMessage);
router.route("/set-sent-message").post(verifyJWT, setSentMessage);
router
    .route("/reply-message")
    .post(
        upload.fields([{ name: "attachments", maxCount: 10 }]),
        verifyJWT,
        sendReplyMessage
    );
router
    .route("/send-message")
    .post(
        upload.fields([{ name: "attachments", maxCount: 10 }]),
        verifyJWT,
        sendMessage
    );

router.route("/delete-for-me").delete(verifyJWT, deleteForMe);
router.route("/delete-for-everyone").delete(verifyJWT, deleteForEveryone);

export default router;
