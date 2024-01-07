import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

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


export { registerUser }