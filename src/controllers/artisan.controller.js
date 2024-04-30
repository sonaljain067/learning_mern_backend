import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Artisan } from "../models/artisan.model.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const createArtisan = asyncHandler(async(req, res) => {
    // fetching from frontend 
    const { description, about, businessName, businessAddress } = req.body 

    // null check 
    if([ businessName, businessAddress ].some((field) => field?.trim() === "")) {
        throw new ApiError(409, "Name, Business Name & Address is required!")
    } 

    // duplicate check 
    const getUser = await req.user 
    const user = await User.findById(getUser._id)

    const artisanCheck = await Artisan.find({ user })

    if(artisanCheck) {
        throw new ApiError(409, "Artisan with id already exists!")
    }

    // fetching logo file path
    let logoLocalPath = req.file 
    if(req.file && req.file?.path) {
        logoLocalPath = req.file?.path 
    }

    // uploading logo on cloudinary 
    const logo = await uploadOnCloudinary(logoLocalPath) 

    // logo upload check  
    if(!logo) {
        throw new ApiError(500, "Logo cannot be uploaded to cloudinary!")
    }

    // creating artisan 
    const createdArtisan = await Artisan.create({
        user, 
        description, 
        about, 
        businessName,
        businessAddress, 
        logo: logo?.secure_url || ""
    })

    // returing response 
    if(!createdArtisan){
        throw new ApiError(500, "Something went wrong while creating artisan!")
    }

    return res.status(200)
        .json(new ApiResponse(200, createdArtisan, "Artisan created succesfully!"))
})

const updateArtisan = asyncHandler(async(req, res) => {
    const { description, about, businessAddress, businessName} = req.body 
    const { artisanId } = req.params 
    if(!artisanId){
        throw new ApiError(400, "Artisan is required to update!")
    }

    const updatedArtisan = await Artisan.findByIdAndUpdate(artisanId, {
        $set: {
            description, 
            about, 
            businessName,
            businessAddress
        }
    }, {
        new: true
    }).select("-user -__v")

    return res.status(200)
        .json(new ApiResponse(200, updatedArtisan, "Artisan updated succesfully!"))
})

const fetchAnArtisan = asyncHandler(async(req, res) => {
    const { artisanId } = req.params 
    if(!artisanId){
        throw new ApiError(400, "Artisan is required to update!")
    }

    const artisan = await Artisan.findById(artisanId) 

    if(!artisan){
        throw new ApiError(404, "No artisan exists with these details!")
    }

    return res.status(200)
        .json(new ApiResponse(200, artisan, "Artisan updated succesfully!"))
})

const fetchAllArtisan = asyncHandler(async(req, res) => {
    const artisans = await Artisan.find() 

    return res.status(200)
        .json(new ApiResponse(200, artisans, "Artisans fetched succesfully!"))
})

const deleteArtisan = asyncHandler(async(req, res) => {
    const { artisanId } = req.params 
    if(!artisanId){
        throw new ApiError(400, "Artisan is required to update!")
    }

    const deletedArtisan = await Artisan.findByIdAndDelete(artisanId)

    if(deletedArtisan) {
        return res.status(200)
            .json(new ApiResponse(200, {}, "Artisan deleted succesfully!"))
    } else {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Artisan already deleted!"))
    }
})

const updateLogo = asyncHandler(async(req, res) => {
    // fetching logo 
    const logoLocalPath = req.file?.path 
    const { artisanId } = req.params 
    
    // empty check 
    if(!logoLocalPath) {
        throw new ApiError(401, "Logo is missing to update!") 
    } 

    // uploading to cloudinary 
    const logo = await uploadOnCloudinary(logoLocalPath)
    
    // logo upload check 
    if(!logo.secure_url) {
        throw new ApiError(500, "Some error while updating logo to server!")
    }
    
    // updating logo in db 
    const updatedLogoArtisan = await Artisan.findByIdAndUpdate(artisanId, {
        $set: {
            logo: logo.secure_url
        }
    }, {
        new: true 
    }).select("-user -__v")

    // returing response 
    return res.status(200)
        .json(new ApiResponse(200, updatedLogoArtisan, "Logo updated succesfully!"))
})

export { createArtisan, updateArtisan, updateLogo, fetchAnArtisan, fetchAllArtisan, deleteArtisan }