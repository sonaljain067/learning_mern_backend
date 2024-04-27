import { User } from "../models/user.model.js"
import { ApiError } from "./ApiError.js"

const duplicateCheck = async(userId, email, username, phoneNumber) => {
    const emailUserCheck = await User.findOne({ email }) 
    if(emailUserCheck && emailUserCheck._id.toString() !== userId.toString()) {
        throw new ApiError(409, `This email has been already used.`)
    }

    const usernameUserCheck = await User.findOne({ username }) 
    if(usernameUserCheck && usernameUserCheck._id.toString() !== userId.toString()) {
        throw new ApiError(409, "This username has been already used.")
    }

    const phoneNumberUserCheck = await User.findOne({ phoneNumber }) 
    if(phoneNumberUserCheck && phoneNumberUserCheck._id.toString() != userId.toString()) {
        throw new ApiError(409, "This phone number has been already used.")
    }
}

export { duplicateCheck } 