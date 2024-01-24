import mongoose, { trusted } from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req,res)=>{
    const { page = 1 , limit = 1, query, sortBy , sortType , userId} = req.query
    const videos = await Video.aggregate([
        {
            $match: {
                    title: {$regex: query,$options: 'i'},
                    description: {$regex: query,$options: 'i'},
                    owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                [sortBy]: sortType == 'ascending'?1:-1
            }
        },
        {
            $skip: (page-1)*10
        },
        {
            $limit: parseInt(limit)   
        }
    ])

    if(!videos){
        throw new ApiError(404,"No videos Found")
    }
    return res.status(200).json(new ApiResponse(200,{videos,length: videos.length,nextPage:parseInt(page)+1},"Videos fetched successfully"))
})

const publishVideo = asyncHandler(async(req,res)=>{
    const { title , description } = req.body;

    if(!title){
        throw new ApiError(404,"Title not found")
    }
    console.log(req.files)
    const thumbnailPath = req.files.thumbnail[0].path
    const videoPath = req.files.video[0].path

    if(!thumbnailPath){
        throw new ApiError(404,"Thumbnail required")
    }

    if(!videoPath){
        throw new ApiError(404,"Video file not found")
    }


    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    const video = await uploadOnCloudinary(videoPath)

    if(!thumbnail){
        throw new ApiError(404,"Thumbnail not found")
    }

    if(!video){
        throw new ApiError(404,"Video file not found")
    }
    await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        duration: 0,
        description: description || "No Description for the video",
        owner: req.user._id,
        views: 0,
        isPublished: true
    })
    return res.status(200).json(new ApiResponse(200,))
})

const updatevideo = asyncHandler(async (req,res)=>{
    const { videoId } = req.params
    const { title , description } = req.body

    const videoDetails = await Video.findById(videoId)
    if(videoDetails.owner != req.user._id){
        throw new ApiError("Unauthorized access to edit the video")
    }

    if(!title && !description){
        throw new ApiError(410,"Title or description both not found")
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId,{
        $set:{
            title,
            description
        }
    },{
        new: true
    })

    if(!updatedVideo){
        throw new ApiError(404,"Video not found")
    }

    return res.status(200).json(new ApiResponse(200,updatedVideo,"Video Updated Successfully"))
})

export {
    getAllVideos,
    publishVideo,
    updatevideo
}