import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteNulls, getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()

//secured routes
router.route('/video/:videoId').post(verifyJWT,toggleVideoLike)
router.route('/comment/:commentId').post(verifyJWT,toggleCommentLike)
router.route('/tweet/:tweetId').post(verifyJWT,toggleTweetLike)

router.route('/videos').get(verifyJWT,getLikedVideos)

router.route('/delete').delete(verifyJWT,deleteNulls)

export default router