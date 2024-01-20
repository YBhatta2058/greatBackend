import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { deleteImageFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

//It generates a new access token and refresh token. Both are returned. Additinoally refresh token is saved in the database
const generateAccessAndRefreshTokens = async (userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAceessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false }) //this is done because when saving user just after creating tokens
                                                // registration validation might take over. Its not needed so thats why
        return {accessToken , refreshToken}
    }catch(err){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

//Controllers starts from here

const registerUser = asyncHandler(async (req,res)=>{
    const { fullName,email,username,password } = req.body;
    
    if(
        [fullName,email,username,password].some((field)=> field?.trim() === "") // some is an array method.
    ){
        throw new ApiError(400,"All fields should be filled !!")
    }
    const existedUser = await User.findOne({
        $or: [{ email },{ username }]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists")
    }
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarLocalPath = req.files.avatar[0].path;
    }

    //Checking is cover image is there because optional chaining gave error. avatar is checked after this checking
    //This has to be done as cover Image is optional
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required !!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) //if no cover image,cloudinary returns empty string. so no error here


    if(!avatar){
        throw new ApiError(400,"Avatar image is required !!")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user !!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser , "User registered Successfully")
    )

    
})

const loginUser = asyncHandler(async (req,res)=>{
    // req body -> data
    // username or email exists
    // find the user
    // check for password
    // access and refresh token
    // send cookie

    const { email , username , password } = req.body;
    if(!username && !email){
        throw new ApiError(400,"username or password is required !!")
    }

    const user = await User.findOne({
        $or: [{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid User Credentials")
    }

    const {accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") // optional step

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.
    status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options)
    .json( 
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // removes the field from document
            }
        },
        {
            new: true //while returning , the new value of user will be returned that has undefined refreshtoken. Optional line as we
                    // are not storing this in any variable
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.
    status(200).
    clearCookie("accessToken",options).
    clearCookie("refreshToken",options).
    json(new ApiResponse(200,{},"User logged out successfully"))
})

const refreshTokenHandler = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
        
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken , newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res.
        status(200).
        cookie("accessToken",accessToken,options).
        cookie("refreshToken",newRefreshToken,options).
        json(new ApiResponse(
            200,
            {accessToken,refreshToken: newRefreshToken},
            "New Access Token Generated successfully"
        ))
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword} = req.body //can check confirm new Password but can do that in front end
    //This first goes to auth middleware . so we have req.user

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid password")
    }

    user.password = newPassword 
    await user.save({validateBeforeSave: false}) //This goes to userSchema.pre('save') and password is hashed

    return res.
    status(200).
    json(new ApiResponse(200 , {} , "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    const currentUser = req.user
    if(!currentUser){
        throw new ApiError(401,"No Logged in user")
    }
    return res.status(200).json(new ApiResponse(200,currentUser,"User fetched Successfully"))
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName , email } = req.body
    if (!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set: {
            fullName,
            email
        }
    },
    {
        new: true
    }).select("-password") // This new: true sets the const user to the newer updated user so that it can be returned properly

    return res.status(200).json(new ApiResponse(200,user,"Account Details Updated Successfully!!"))
})

const updateUserAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing !!")
    }

    const oldUser = await User.findById(req.user?._id)
    const oldUserAvatarUrl = oldUser.avatar
    const oldAvatarPublicId = oldUserAvatarUrl.split('.')[2].split('/')[5]

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar on cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user?._id , {
        $set: {
            avatar: avatar.url
        }
    } ,
    {
        new: true
    }).select("-password")

    if(!user){
        throw new ApiError(400,"User not found while updating avatar")
    }
    await deleteImageFromCloudinary(oldAvatarPublicId)
    return res.status(200).json(new ApiResponse(200,user,"Avatar changed successfully !!"))
})

const updateUserCoverImage = asyncHandler(async (req,res)=>{
    const coverLocalPath = req.file?.path;

    if(!coverLocalPath){
        throw new ApiError(400,"Cover Image file is missing !!")
    }

    const oldUser = await User.findById(req.user?._id)
    const oldUserCoverImageUrl = oldUser.coverImage
    const oldCoverImagePublicId = oldUserCoverImageUrl.split('.')[2].split('/')[5]

    const coverImage = await uploadOnCloudinary(coverLocalPath)
    
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading cover Image on cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user?._id , {
        $set: {
            coverImage: coverImage.url
        }
    } ,
    {
        new: true
    }).select("-password")

    if(!user){
        throw new ApiError(400,"User not found while updating cover Image")
    }

    await deleteImageFromCloudinary(oldCoverImagePublicId)

    return res.status(200).json(new ApiResponse(200,user,"Cover Image changed successfully !!"))
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const { username } = req.params
    
    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }

    // An array is returned by aggregate
    const channel = await User.aggregate([{
        $match: {
            username: username
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    },
    {
        $addFields: {
            subscibersCount: {
                $size: "$subscribers"  // $subscribers ( $ sign ) because it is field now
            },
            channelsSubscribedToCount: {
                $size: "$subscribedTo"
            },
            isSubscribed: {
                $cond : {
                    if: {$in: [req.user?._id , "$subscribers.subscriber"]}, // $in can be used in both arrays and objects
                    then: true,
                    else: false
                }
            }
        }
    },
    {
        $project: {
            fullName: 1,
            username: 1,
            subscibersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1
        }
    }
    ]) 

    if(!channel?.length){
        throw new ApiError(404, "Channel does not exist")
    }

    return res.
    status(200).
    json(new ApiResponse(200,channel[0],"Channel Fetched Successfully"))

})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner" // This is added in the watch history array
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"Watch History fetched successfully"))

})

export 
{ 
  registerUser, 
  loginUser,
  logoutUser,
  refreshTokenHandler,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}