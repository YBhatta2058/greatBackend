import { Router } from "express";

import {
    getCurrentUser, 
    loginUser, 
    logoutUser, 
    refreshTokenHandler, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage,
    getWatchHistory,
    changeCurrentPassword,
    getUserChannelProfile
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { healthCheck } from "../controllers/healthCheck.controller.js";

const router = Router();

router.route('/register').post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]),registerUser)


router.route('/login').post(loginUser)

router.route('/healthCheck').get(healthCheck)


//secured routes
router.route('/logout').post(verifyJWT ,logoutUser)

router.route('/refreshToken').post(refreshTokenHandler)

router.route('/changePassword').post(verifyJWT,changeCurrentPassword)

router.route('/updateAccountDetails').patch(verifyJWT,updateAccountDetails)

router.route('/updateAvatar').patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route('/updateCoverImage').patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route('/getUser').get(verifyJWT,getCurrentUser)

router.route('/channel/:username').get(verifyJWT,getUserChannelProfile)

router.route('/history').get(verifyJWT,getWatchHistory)

export default router;