import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req,res)=>{
    return res.status(200).json(new ApiResponse(200,{Message: "Health Checker to check the status of the website"},"Health Checker controller working properly"))
})

export {
    healthCheck
}