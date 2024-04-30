import { v2 as cloudinary} from "cloudinary"
import { ApiError } from "./ApiError.js"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) {
            throw new ApiError(400, "Local file path is missing to upload on cloudinary!")
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        if(localFilePath){
            fs.unlinkSync(localFilePath) 
        }
        return response 
    } catch(err) {
        if(localFilePath){
            fs.unlinkSync(localFilePath) 
        }
        return null 
    }
}

export { uploadOnCloudinary }