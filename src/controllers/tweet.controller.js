import { Tweet } from '../models/tweet.model.js';
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { isValidObjectId } from 'mongoose';
import { User } from '../models/user.model.js'

const createTweet = asyncHandler(async (req,res)=>{
    console.log(req.body)
    const { content } = req.body
    console.log(content)
    if(!content || content?.trim() == ''){
        throw new ApiError(415,"Content is required")
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user?.id
    })
    if(!tweet){
        throw new ApiError(415,"Tweet not found")
    }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req,res)=>{
    const { userId } = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError("Invalid user Id")
    }

    const tweet = await Tweet.find({owner:userId}).select("-owner")
    if(!tweet){
        throw new ApiError(420,"Tweet not found")
    }

    return res.status(200).json(new ApiResponse(200,tweet,"All Tweets fetched"))
})

const getTweetById = asyncHandler(async (req,res)=>{
    
})

const updateTweet = asyncHandler(async (req,res)=>{
    const { content } = req.body;
    const { tweetId } = req.params;
    if(!content || content?.trim() == ""){
        throw new ApiError(415,"Content is required")
    }
    
})

export {
    createTweet,
    getUserTweets
}
