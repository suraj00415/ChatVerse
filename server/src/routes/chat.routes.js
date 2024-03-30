import { Router } from "express";
import {
    addNewParticipantsInGroupChat,
    createGroup,
    createOneToOneChat,
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

export default router;
