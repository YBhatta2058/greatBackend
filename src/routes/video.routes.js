import express from "express"
import { deleteVideo, getAllVideos, getVideoById, publishVideo, updatevideo } from "../controllers/video.controller.js"
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

router.route('/videoById/:videoId').get(verifyJWT,getVideoById)

router.route('/delete/:videoId').patch(verifyJWT,deleteVideo)


export default router