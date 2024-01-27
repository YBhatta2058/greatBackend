import { Tweet } from '../models/tweet.model.js';
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { isValidObjectId } from 'mongoose';
import { User } from '../models/user.model.js'
import mongoose from 'mongoose';

const createTweet = asyncHandler(async (req,res)=>{
    const { content } = req.body
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
        throw new ApiError(413,"Invalid user Id")
    }

    const tweet = await Tweet.find({owner:userId}).select("-owner")
    if(!tweet){
        throw new ApiError(420,"Tweet not found")
    }

    return res.status(200).json(new ApiResponse(200,tweet,"All Tweets fetched"))
})

const getTweetById = asyncHandler(async (req,res)=>{
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(413,"Invalid tweet Id")
    }
    const tweet = await Tweet.findById({tweetId}).select("-owner")
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet fetched"))
})

const updateTweet = asyncHandler(async (req,res)=>{
    const { content } = req.body;
    const { tweetId } = req.params;
    if(!content || content?.trim() == ""){
        throw new ApiError(415,"Content is required")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(413,"Invalid tweet Id")
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set: {
            content
        }
    },{
        new: true
    })
    if(!updatedTweet){
        throw new ApiError(405,"Tweet cannot be updated")
    }
    return res.status(200).json(new ApiResponse(200,updatedTweet,"Tweet updated Successfully"))
})

const deleteTweet = asyncHandler(async (req,res)=>{
    const { tweetId } = req.params;
    const tweet = await Tweet.findById(tweetId)
    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(412,"Unauthorized access to update the tweet. Only the owner can update the tweet")
    }
    console.log("Authentication ni vayo")

    const deleteResponse = await Tweet.findByIdAndDelete(tweetId)
    console.log(deleteResponse)

    return res.status(200).json(new ApiResponse(200,deleteResponse,"Tweet Deleted Successfully"))
})

const getTweetOwnerDetails = asyncHandler(async (req,res)=>{
    const { tweetId } =  req.params 
    const tweetOwner = await Tweet.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(tweetId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {    
                            $project:{
                                username: 1,
                                fullName: 1,
                                email: 1
                            }
                    }
                ]
            }
        },
        {
            $addFields: {
                ownerDetails: {
                    $first: "$ownerDetails"
                }
            }
        },
        
    ])
    console.log(tweetOwner)
    if(!tweetOwner){
        throw new ApiError(404,"Owner details not found")
    }
    return res.status(200).json(new ApiResponse(200,tweetOwner,"Tweet Owner details fetched successfully"))
})

export {
    createTweet,
    getUserTweets,
    getTweetById,
    deleteTweet,
    updateTweet,
    getTweetOwnerDetails
}
