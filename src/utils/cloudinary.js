import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // file has been uploaded successfully
        fs.unlinkSync(localFilePath)
        return response; // you can directly return the response.url as well
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

const deleteImageFromCloudinary = async (public_id)=>{
    try{
        if(!public_id){
           throw new ApiError(404,"Error while deleting image from Cloudinary. No image found")
        }
        await cloudinary.uploader.destroy(public_id)
    }catch(error){
        throw new ApiError("Error while deleting image from cloudinary")
    }
}

export { uploadOnCloudinary ,  deleteImageFromCloudinary }