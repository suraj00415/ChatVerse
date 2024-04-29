import { Router } from "express";
import {
    addNewParticipantsInGroupChat,
    createGroup,
    createOneToOneChat,
    deleteGroupChat,
    getAllChats,
    leaveGroupChat,
    removeParticipantFromGroupChat,
    searchAvailableUsers,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router
    .route("/create-one-chat/:recieverId")
    .post(verifyJWT, createOneToOneChat);

router.route("/create-group").post(upload.single("avatar"),verifyJWT, createGroup);

router
    .route("/participants/add")
    .post(verifyJWT, addNewParticipantsInGroupChat);
router
    .route("/participants/remove")
    .delete(verifyJWT, removeParticipantFromGroupChat);
router.route("/leave-group/:chatId").delete(verifyJWT, leaveGroupChat);
router.route("/delete-group/:chatId").delete(verifyJWT, deleteGroupChat);
router.route("/get-all-chats").get(verifyJWT, getAllChats);
router.route("/get-all-users/:query").get(verifyJWT, searchAvailableUsers);
router.route("/get-all-users").get(verifyJWT, searchAvailableUsers);

export default router;
