import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


export const verifyJWT = asyncHandler(async (req,_,next)=>{ // underscore because res is not needed in this function
    try {
        const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401,"Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access token")
        }
    
        req.user = user; // adding the user object in the req so that can be accessed from anywhere. logged in user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})
