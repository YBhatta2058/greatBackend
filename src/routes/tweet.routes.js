import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet,
     deleteTweet,
     getTweetOwnerDetails,
     getUserTweets, 
     updateTweet
    }
 from "../controllers/tweet.controller.js"

const router = Router()


//secured routes
router.route('/create').post(verifyJWT,createTweet)
router.route('/getAll/:userId').get(verifyJWT,getUserTweets)
router.route('/update/:tweetId').patch(verifyJWT,updateTweet)
router.route('/delete/:tweetId').delete(verifyJWT,deleteTweet)
router.route('/owner/:tweetId').get(getTweetOwnerDetails)

export default router;

