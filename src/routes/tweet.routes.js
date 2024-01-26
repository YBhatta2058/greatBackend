import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet,
     getUserTweets 
    }
 from "../controllers/tweet.controller.js"

const router = Router()


//secured routes
router.route('/create').post(verifyJWT,createTweet)
router.route('/getAll/:userId').get(verifyJWT,getUserTweets)

export default router;

