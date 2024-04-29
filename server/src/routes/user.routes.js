import { Router } from "express";
import {
    loginUser,
    logoutUser,
    refreshToken,
    regeisterUser,
    resendVerifyEmail,
    updateAvatar,
    verfiyEmail,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    regeisterUser
);

router.route("/login").post(loginUser);
router.route("/verify-email").post(verifyJWT, verfiyEmail);
router.route("/refresh-token").get(verifyJWT, refreshToken);
router.route("/resend/verify-email").post(verifyJWT, resendVerifyEmail);
router.route("/logout").post(verifyJWT, logoutUser);
router
    .route("/update-avatar")
    .patch(upload.single("avatar"), verifyJWT, updateAvatar);

export default router;
