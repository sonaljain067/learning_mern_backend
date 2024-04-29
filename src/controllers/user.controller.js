import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { isValidEmail } from "../utils/validateUtil.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import fs from "fs"
import jwt from "jsonwebtoken"
import { duplicateCheck } from "../utils/duplicateCheck.js"

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
    const { username, firstName, lastName, phoneNumber, email, password } = req.body

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
    if(email) {
        const isEmailValid = isValidEmail(email)
        if(!isEmailValid) {
            throw new ApiError(400, "Please enter correct email address!")
        } 
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
    // resetting refresh token in db 
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: undefined
            }
        }) 
    
    // deleting refresh token in cookies 
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
    // fetching refresh token
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // validation check 
    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request while refreshing refresh token!" )
    }
    try{ 
        // decoding refresh token payload 
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        console.log(decodedToken)

        // fetching user from payload 
        const user = await User.findById(decodedToken?._id)

        // refresh token validation check 
        if(!user) {
            throw new ApiError(401, "Invalid refresh token, no user found for refresh token!")
        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used!")
        }

        // generating new access & refresh token 
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        // setting tokens in cookies & response 
        const options = {
            httpOnly: true, 
            secure: true 
        }
        
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, newRefreshToken }, "Access & Refresh token generated succesfully!"))
    } catch(error) {
        throw new ApiError(500, `Error occured while refreshing access & refresh token: ${error?.message}`)
    }
})

const changePassword = asyncHandler(async(req, res) => {
    // fetching passwords 
    const { oldPassword, newPassword, confirmPassword } = req.body
    
    // getting current user 
    const user = await User.findOne(req?.user?._id) 

    // current password check 
    const isPasswordValid = await user.isPasswordCorrect(oldPassword, user.password)

    // password validation check 
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid old password!")
    }

    if(newPassword !== confirmPassword) {
        throw new ApiError(409, "New password doesn't match with confirmed password!")
    }

    // changing password in db 
    user.password = newPassword 
    user.save({ validateBeforeSave: false }) 

    // sending success response 
    return res.status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully!"))

})

const getCurrentUser = asyncHandler(async(req, res) => {
    // fetching & returning current user 
    return res.status(200)
        .json(new ApiResponse(200, await req.user, "Current user fetched succesfully!"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    // fetching fields to update 
    const { username, firstName, lastName, phoneNumber, email } = req.body 

    // empty field check 
    if(!username || !firstName || !lastName || !phoneNumber || !email){
        throw new ApiError(409, "Fields are required to update the details!")
    }   

    // validation check 
    if(email) {
        const isEmailValid = isValidEmail(email)
        if(!isEmailValid) {
            throw new ApiError(400, "Please enter correct email address!")
        } 
    }

    const user = await User.findOne(req.user._id)

    // duplicate check 
    try{
        await duplicateCheck(user._id, email, username, phoneNumber) 
        
    } catch(error) {
        throw error 
    }

    // updating values in db 
    const updatedUserDetails = await User.findByIdAndUpdate(user._id, {
        $set: {
            username, 
            firstName, 
            lastName, 
            phoneNumber, 
            email 
        }
    }, {
        new: true 
    }).select("-password -refreshToken -__v")

    // returning success response 
    return res.status(200)
        .json(new ApiResponse(200, updatedUserDetails, "User details succesfully updated!"))
    
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    // fetching avatar 
    const avatarLocalPath= req.file?.path 

    if(!avatarLocalPath) {
        throw new ApiError(401, "Avatar file is missing!")
    }

    // uploading to cloudinary 
    const avatar = uploadOnCloudinary(avatarLocalPath)

    if(!avatar.secure_url) {
        throw new ApiError(500, "Some error while updating avatar!")
    }

    const updatedUserDetails = User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.secure_url
        }
    }, {
        new: true
    }).select("-password -refreshToken -__v")

    return res.status(200)
        .json(new ApiResponse(200, updatedUserDetails, "Avatar uploaded succesfully!"))

})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar }
