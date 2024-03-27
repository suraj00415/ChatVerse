import { Router } from "express";
import {
    loginUser,
    logoutUser,
    regeisterUser,
    resendVerifyEmail,
    verfiyEmail,
} from "../controllers/user.controllers.js";
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
router.route("/resend/verify-email").post(verifyJWT, resendVerifyEmail);
router.route("/logout").post(verifyJWT, logoutUser);
export default router;