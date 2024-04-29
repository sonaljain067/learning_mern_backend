import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Address } from "../models/address.model.js"
import { isValidPhoneNumber } from "../utils/validateUtil.js"
import { User } from "../models/user.model.js"


const addAnAddress = asyncHandler(async(req, res) => {
    // input from frontend 
    const { fullName, phoneNumber, addressLine1, addressLine2, city, state, pincode, country, isDefaultAddress, propertyType, deliveryInstructions } = req.body 
    const user = await req.user
    const userId = await User.findOne({ _id: user._id })
    console.log(userId)

    // console.log(await req.user)
    // fields check 
    if(!(fullName && phoneNumber && addressLine1 && city && state && pincode && country)) {
        throw new ApiError(409, "Required fields to add address is missing!")
    }

    // validation check 
    const isPhoneNumberValid = isValidPhoneNumber(phoneNumber)
    if(!isPhoneNumberValid) {
        throw new ApiError(409, "Please enter correct phone number.")
    }

    // creating address in db
    const createdAddress = await Address.create({
        fullName, 
        phoneNumber,
        addressLine1, 
        addressLine2: addressLine2 || "",
        city,
        state, 
        pincode,
        country, 
        isDefaultAddress: isDefaultAddress || false, 
        propertyType: propertyType || "",
        deliveryInstructions: deliveryInstructions || "",
        userId 
    }).select("-userId ")

    // returning response 
    return res.status(200)
        .json(new ApiResponse(200, createdAddress, "Address created succesfully!"))

})  

const fetchAnAddress = asyncHandler(async(req, res) => {
    // input from frontend 
    const { addressId } = req.params 

    // get address 
    const address = await Address.findById({
        _id: addressId
    })

    // returing response
    return res.status(200)
        .json(new ApiResponse(200, address, "Address fetched succesful!"))

})

const updateAnAddress = asyncHandler(async(req, res) => {
    // input from frontend 
    let { fullName, phoneNumber, addressLine1, addressLine2, city, state, pincode, country, isDefaultAddress, propertyType, deliveryInstructions } = req.body 

    // address fetch 
    const { addressId } = req.params 
    const address = await Address.findById({_id: addressId}) 

    // empty value check 
    if(!(fullName || phoneNumber || addressLine1 || addressLine2 || city || state || pincode || country || isDefaultAddress || propertyType || deliveryInstructions)){
        throw new ApiError(409, "Fields are required to update the details!")
    }

    // updating address fields
    const updatedAddress = await Address.findByIdAndUpdate(address._id, {
        $set: {
            fullName, 
            phoneNumber,
            addressLine1, 
            addressLine2,
            city,
            state, 
            pincode, 
            country, 
            isDefaultAddress, 
            propertyType,
            deliveryInstructions
        }
    }, {
        new: true
    })

    // returning response 
    return res.status(200)
        .json(new ApiResponse(200, updatedAddress, "Address updated succesfully!"))
    
})

const fetchUsersAddresses = asyncHandler(async(req, res) => {
    // retrieving user's address from db  
    const user = await User.findOne({ _id: req.user._id })

    const addresses = await Address.find({ userId: user }) 

    // returing response 
    return res.status(200) 
        .json(new ApiResponse(200, addresses, "User's address fetched succesfully!"))
})

const deleteUserAddress = asyncHandler(async(req, res) => {
    // fetching from frontend 
    const { addressId } = req.params 
    const user = await req.user 
    const userId = await User.findById({ _id: user._id })

    // null check 
    if(!addressId) {
        throw new ApiError(409, "Address to delete is missing!")
    }

    // deleting address 
    const deletedUserAddress = await Address.findByIdAndDelete({ 
        _id: addressId, 
        userId 
    }) 

    // returing response 
    if(!deletedUserAddress) {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Address deleted succesfully!"))
    } else {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Address already deleted!"))
    }
})

export { addAnAddress, fetchAnAddress, fetchUsersAddresses, deleteUserAddress, updateAnAddress }