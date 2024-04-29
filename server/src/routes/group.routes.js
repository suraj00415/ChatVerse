import { Router } from "express";
import {
    addAdmins,
    getGroupChatDetails,
    renameGroupChat,
    updateGroupAvatar,
} from "../controllers/group.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/rename-group").post(verifyJWT, renameGroupChat);
router.route("/group-detail/:chatId").get(verifyJWT, getGroupChatDetails);
router
    .route("/update-group-avatar/:chatId")
    .patch(upload.single("avatar"), verifyJWT, updateGroupAvatar);
router.route("/add-admins").post(verifyJWT, addAdmins);
export default router;
