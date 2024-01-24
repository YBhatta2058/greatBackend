import express from "express"
import { getAllVideos, publishVideo, updatevideo } from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router()

router.get('/video',verifyJWT,getAllVideos)
router.route('/publishVideo').post(upload.fields([
    {
        name: 'thumbnail',
        maxCount: 1
    },
    {
        name: 'video',
        maxCount: 1
    }
]
)
,verifyJWT,publishVideo)

router.route('/updateVideo/:videoId').post(verifyJWT,updatevideo)

export default router