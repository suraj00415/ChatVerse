import { Router } from "express";
import {
    addNewParticipantsInGroupChat,
    createGroup,
    createOneToOneChat,
    deleteGroupChat,
    leaveGroupChat,
    removeParticipantFromGroupChat,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router
    .route("/create-one-chat/:recieverId")
    .post(verifyJWT, createOneToOneChat);

router.route("/create-group").post(verifyJWT, createGroup);

router
    .route("/participants/add")
    .post(verifyJWT, addNewParticipantsInGroupChat);
router
    .route("/participants/remove")
    .delete(verifyJWT, removeParticipantFromGroupChat);
router.route("/leave-group/:chatId").delete(verifyJWT, leaveGroupChat);
router.route("/delete-group/:chatId").delete(verifyJWT, deleteGroupChat);

export default router;