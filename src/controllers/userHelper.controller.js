import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

import { Product } from "../models/product.model.js"
import { RatingReview } from "../models/ratingreview.model.js"
import { User } from "../models/user.model.js"
import { Wishlist } from "../models/wishlist.model.js"


const toggleUserWishlist = asyncHandler(async(req, res) => {
    const { productId } = req.params 
    const userId = req.user._id 

    const ifProductExists = await Wishlist.find({ productId })

    if(!ifProductExists) {
        const createdProduct = await Wishlist.create({
            productId, 
            userId 
        })
        return res.status(201)
            .json(new ApiResponse(200, createdProduct, "Item added succesfully to wishlist!"))
    } else {
        await Wishlist.findByIdAndDelete(ifProductExists._id)
        return res.status(201)
            .json(new ApiResponse(200, {}, "Item succesfully removed from wishlist!"))
    }
})

const getUserWishlist = asyncHandler(async(req, res) => {
    const userId = req.user 

    const userWishlist = await Wishlist.find({ userId })

    return res.status(200)
    .json(new ApiResponse(200, userWishlist, "Wishlist of user fetched succesfully!"))
})

const createRatingReview = asyncHandler(async(req, res) => {
    const { productId } = req.params 
    const { rating, review } = req.body
    const filesLocalPath = req.files.images

    if(!productId) {
        throw new ApiError(400, "Product is required to add ratings / reviews!")
    }
     
    if(!(rating && review)) {
        throw new ApiError(400, "Rating & Review is missing!")
    }

    // upload to cloudinary 
    const imagesArr = [], images = []

    if(filesLocalPath){
        const uploadPromise = filesLocalPath.map(async(field) => {
            const image = await uploadOnCloudinary(field.path)
            imagesArr.push(image) 
        })
        await Promise.all(uploadPromise)

        imagesArr.map((field) => {
            if(field) {
                images.push(field.secure_url)
            }
        })
    }
    
    const product = await Product.findById(productId) 
    
    const user = await User.findById(req.user._id)
    const isRatingReviewExists = await RatingReview.find({
        user, 
        product
    })
    if(isRatingReviewExists) {
        return res.status(200)
            .json(new ApiResponse(200, isRatingReviewExists, "Feedback already provided!"))
    }
    const createdRatingReview = await RatingReview.create({
        rating, 
        review, 
        images, 
        user, 
        product 
    })

    return res.status(201)
        .json(new ApiResponse(200, createdRatingReview, "Feedback submitted succesfully!"))
})

const updateRatingReview = asyncHandler(async(req, res) => {
    const { ratingreviewId } = req.params 
    const { rating, review } = req.body
    const filesLocalPath = req.files.images

    if(!ratingreviewId) {
        throw new ApiError(400, "Product is required to update ratings / reviews!")
    }
     
    if(!(rating || review)) {
        throw new ApiError(400, "Details are missing to update!")
    }
    
    // upload to cloudinary 
    const imagesArr = [], images = []
    if(filesLocalPath){
        const uploadPromise = filesLocalPath.map(async(field) => {
            const image = await uploadOnCloudinary(field.path)
            imagesArr.push(image) 
        })
        await Promise.all(uploadPromise)
    
        imagesArr.map((field) => {
            if(field) {
                images.push(field.secure_url)
            }
        })
    }
   
    const ratingReview = await RatingReview.findById(ratingreviewId)

    if(images.length <= 0) {
        images = ratingReview.images  
    }
    
    const user = await User.findById(req.user._id)

    const createdRatingReview = await RatingReview.findByIdAndUpdate(ratingreviewId, {
        rating, 
        review, 
        images, 
        user
    }, {
        new: true 
    })

    return res.status(201)
        .json(new ApiResponse(200, createdRatingReview, "Feedback updated succesfully!"))

}) 

const deleteRatingReview = asyncHandler(async(req, res) => {
    const { ratingreviewId } = req.params 
    const ratingReview = await RatingReview.findById(ratingreviewId)

    if(!ratingReview) {
        throw new ApiError(400, "No such feedback exists!")
    }

    const deletedRatingReview = await RatingReview.findByIdAndDelete(ratingreviewId)

    if(deletedRatingReview) {
        return res.status(200, {}, "Feedback deleted succesfully!")
    } else {
        return res.status(200, {}, "Feedback already deleted!")
    }

})

const getProductRatingReviews = asyncHandler(async(req, res) => {
    const { productId } = req.params 
    if(!productId) {
        throw new ApiError(400, "Product is missing to fetch feedback!")
    }
    const product = await Product.findById(productId)
    const user = await User.findById(req.user._id)

    const productRatingReview = await RatingReview.find({ 
        product, user 
    })

    return res.status(200) 
        .json(new ApiResponse(200, productRatingReview, "Feedback of product fetched succesfully!"))

})

const getUserAllRatingReviews = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id) 
    
    const usersRatingReview = await RatingReview.find({ user })

    return res.status(200) 
        .json(new ApiResponse(200, usersRatingReview, "User's feedback fetched succesfully!"))
})

export { toggleUserWishlist, getUserWishlist, createRatingReview, updateRatingReview, deleteRatingReview, getProductRatingReviews, getUserAllRatingReviews }