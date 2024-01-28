import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(413, "Invalid object id for video");
    }
    const video = await Video.find({
        _id: new mongoose.Types.ObjectId(videoId),
    });
    if (!video) {
        throw new ApiError("Video does not exist");
    }
    const like = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (!like) {
        throw new ApiError(410, "Error while liking");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "Video Liked Succssfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(413, "Invalid object id for comment");
    }
    const like = await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (!like) {
        throw new ApiError(410, "Error while liking");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "Comment Liked Succssfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(413, "Invalid object id for tweet");
    }
    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (!like) {
        throw new ApiError(410, "Error while liking");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, like, "Tweet Liked Succssfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({
        video: { $exists: true, $ne: null }, // ne means not equal
        comment: null,
        tweet: null,
        likedBy: req.user._id,
    })
        .populate("video")
        .select("video");

    if (!likedVideos) {
        throw new ApiError(415, "Error while getting the liked videos");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked Videos fetched successfully",
            ),
        );
});

const deleteNulls = asyncHandler(async (req, res) => {
    const users = await User.find({}, "_id"); 

    const userIds = users.map((user) => user._id);

    const result = await Like.deleteMany({
        video: { $in: userIds },
    });
    res.status(200).json(new ApiResponse(200, result, "Deleted Successfully"));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    deleteNulls,
};
