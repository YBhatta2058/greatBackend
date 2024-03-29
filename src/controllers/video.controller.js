import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { deleteImageFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/likes.model.js";


const getAllVideos = asyncHandler(async (req,res)=>{
    const { page = 1 , limit = 2, query = "", sortBy="title" , sortType = 'ascending' , userId} = req.query
    if(query == ""){
        const videos = await Video.find({owner:userId});
        return res.status(200).json(new ApiResponse(200,videos,"Videos fetched successfullly"))
    }
    else{
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
}
})

const publishVideo = asyncHandler(async(req,res)=>{
    const { title , description } = req.body;

    if(!title){
        throw new ApiError(404,"Title not found")
    }
    if(!req.files || !(Array.isArray(req.files.thumbnail)) || req.files.thumbnail.length <= 0){
        throw new ApiError(411,"Missing thumbnail file")
    }
    if(!req.files || !(Array.isArray(req.files.video)) || req.files.video.length <= 0){
        throw new ApiError(411,"Missing video file")
    }
    const thumbnailPath = req.files?.thumbnail[0].path
    const videoPath = req.files?.video[0].path


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
    const uploadedVideo = await Video.create({
        videoFile: {
            public_id: video?.public_id,
            url: video?.url
        },
        thumbnail: {
            public_id: video?.public_id,
            url: thumbnail.url
        },
        title,
        duration: video?.duration,
        description: description || "No Description for the video",
        owner: req.user._id,
        views: 0,
        isPublished: true
    })
    return res.status(200).json(new ApiResponse(200,uploadedVideo,"Video uploaded successfully"))
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

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError("Video Id not valid")
    }

    const video = await Video.findById({_id:videoId})
    if(!video){
        throw new ApiError("Video not found")
    }

    return res.status(200).json(new ApiResponse(
        200,video,"Video Fetched Successfully"
    ))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById({_id: videoId})

    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(!(video?.owner?.equals(req.user?._id))){
        throw new ApiError(404,"Unauthorized access to delete the video. Only owner of video can do so")
    }

    const videoPublicId = video.videoFile.public_id
    const thumbnailPublicId = video.thumbnail.public_id

    const deleteResonse = await Video.deleteOne(video)
    
    deleteImageFromCloudinary(videoPublicId)
    deleteImageFromCloudinary(thumbnailPublicId)

    return res.status(200).json(new ApiResponse(200,deleteResonse,"Video deleted Successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(410,"Invalid Video id")
    }
    const vid = await Video.findByIdAndUpdate({_id: videoId},{
        $set:{
            isPublished: false
        }
    })
})

const getLikes = asyncHandler(async (req,res)=>{
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"Video Id not valid")
    }

    const likers = await Like.find({video: mongoose.Types.ObjectId(videoId)})
    return res.status(200).json()
})

export {
    getAllVideos,
    publishVideo,
    updatevideo,
    getVideoById,
    deleteVideo
}