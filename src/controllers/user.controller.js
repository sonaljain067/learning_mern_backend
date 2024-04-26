import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { isValidEmail } from "../utils/validateEmail.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import fs from "fs"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken() 
        
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false }) 

        return { accessToken, refreshToken }

    } catch(error){
        throw new ApiError(500, "Something went wrong while generating access & refresh token!")
    }
}

const registerUser = asyncHandler(async(req, res) => {
    // input from frontend 
    const { username, firstName, lastName, phoneNumber, email, password} = req.body

    // fields check 
    if(!username || !firstName || !lastName || !phoneNumber || !email || !password) {
        throw new ApiError(409, "Fields are required to create user!")
    }

    // data validation 
    if(
        [firstName, email, username, password, lastName, phoneNumber].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required!!")
    }

    const isEmailValid = isValidEmail(email)
    if(!isEmailValid) {
        throw new ApiError(400, "Please enter correct email address!")
    } 

    // avatar file validation 
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required!!")
    }

    // if user already exists 
    const userExists = await User.findOne({
        $or: [{ username }, { email }] 
    })
    if(userExists) {
        fs.unlinkSync(avatarLocalPath)
        throw new ApiError(409, "User with email / username already exists!")
    }


    // uploading avatar on cloudinary 
    const avatar = await uploadOnCloudinary(avatarLocalPath) 
    
    if(!avatar){
        throw new ApiError(500, "Avatar cannot be uploaded to cloudinary!")
    }

    // creating user in db 
    const user = await User.create({
        email, 
        firstName,
        lastName, 
        username: username.toLowerCase(),  
        password, 
        phoneNumber,
        avatar: avatar?.secure_url,
    })

    // user creation check 
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user!")
    }

    // returning response 
    return res.status(201).json(
        new ApiResponse(
            200, 
            createdUser, 
            "User Created succesfully!!"
        )
    ) 
})

const loginUser = asyncHandler(async(req, res) => {
    // input from frontend 
    const { username, email, password } = req.body 

    // fields check 
    if(!(username || email)) {
        throw new ApiError(409, "Email / Username is required to login!")
    }
    if(!password){
        throw new ApiError(409, "Password is required to login!")
    }

    // validation check 
    const isEmailValid = isValidEmail(email)
    if(!isEmailValid) {
        throw new ApiError(400, "Please enter correct email address!")
    } 

    // user check in db 
    const user = await User.findOne({
        $or: [{ username }, { email}]
    })

    if(!user) {
        throw new ApiError(404, "User with this email / password doesn't exist!")
    }

    // checking user's password 
    const isPasswordValid = await user.isPasswordCorrect(password, user.password) 

    if(!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password!")
    }

    // generating access & refresh token 
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken -__v")

    // sending cookies & response 
    const options = {
        httpOnly: true, 
        secure: true 
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser,
            accessToken, 
            refreshToken
        }, "User logged in succesfully!"))

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        }) 
    
    const options = {
        httpOnly: true, 
        secure: true 
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out succesfully!"))


})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request while refreshing refresh token!" )
    }

    try{
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if(!user) {
            throw new ApiError(401, "Invalid refresh token!")
        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used!")
        }

        const { accessToken, newRefreshToken } = generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true, 
            secure: true 
        }
        
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, newRefreshToken }, "Access & Refresh token generated succesfully!"))
    } catch(error) {
        throw new ApiError(500, `Error occured while refreshing access & refresh token: ${err?.message}`)
    }
})
export { registerUser, loginUser, logoutUser, refreshAccessToken }
