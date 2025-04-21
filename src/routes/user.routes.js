import { Router } from "express";
import { loginuser, registerUser,logoutUser, refreshAcessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([{
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }

    ]),
   
    registerUser
    )
    router.route("/login").post(loginuser)
    router.route("/logout").post(verifyJWT ,logoutUser)
    router.route("/refresh-token").post(refreshAcessToken)
export default router;
