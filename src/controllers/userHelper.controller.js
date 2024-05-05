import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

import { Product } from "../models/product.model.js"
import { RatingReview } from "../models/ratingreview.model.js"
import { User } from "../models/user.model.js"
import { Wishlist } from "../models/wishlist.model.js"

const toggleUserWishlist = asyncHandler(async(req, res) => {
    // input from frontend 
    const { productId } = req.params 
    const userId = req.user._id 

    // product exists check
    const ifProductExists = await Wishlist.findOne({ productId })
    
    if(!ifProductExists) {
        // user product creation 
        const createdProduct = await Wishlist.create({
            productId, 
            userId 
        })

        // response return 
        return res.status(201)
            .json(new ApiResponse(200, createdProduct, "Item added succesfully to wishlist!"))
    } else {
        // user product deletion 
        await Wishlist.findByIdAndDelete(ifProductExists._id)

        // response return 
        return res.status(201)
            .json(new ApiResponse(200, {}, "Item succesfully removed from wishlist!"))
    }
})

const getUserWishlist = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id)

    // find wishlist of user 
    const userWishlist = await Wishlist.find({ user})

    // response return 
    return res.status(200)
    .json(new ApiResponse(200, userWishlist, "Wishlist of user fetched succesfully!"))
})

const createRatingReview = asyncHandler(async(req, res) => {
    // input from frontend 
    const { productId } = req.params 
    const { rating, review } = req.body
    const filesLocalPath = req.files.images

    // fields check 
    if(!productId) {
        throw new ApiError(400, "Product is required to add ratings / reviews!")
    }
     
    if(!(rating && review)) {
        throw new ApiError(400, "Rating & Review is missing!")
    }

    // images upload to server 
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
    
    // find product, user 
    const product = await Product.findById(productId) 
    const user = await User.findById(req.user._id)

    // feedback exists check 
    const isRatingReviewExists = await RatingReview.find({
        user, 
        product
    })
    if(isRatingReviewExists) {
        return res.status(200)
            .json(new ApiResponse(200, isRatingReviewExists, "Feedback already provided!"))
    }

    // feedback creation 
    const createdRatingReview = await RatingReview.create({
        rating, 
        review, 
        images, 
        user, 
        product 
    })

    // response return 
    return res.status(201)
        .json(new ApiResponse(200, createdRatingReview, "Feedback submitted succesfully!"))
})

const updateRatingReview = asyncHandler(async(req, res) => {
    // input from frontend 
    const { ratingreviewId } = req.params 
    const { rating, review } = req.body
    const filesLocalPath = req.files.images

    // fields check 
    if(!ratingreviewId) {
        throw new ApiError(400, "Product is required to update ratings / reviews!")
    }
     
    if(!(rating || review)) {
        throw new ApiError(400, "Details are missing to update!")
    }
    
    // images upload to server 
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
    
    // feedback exists check 
    const ratingReview = await RatingReview.findById(ratingreviewId)

    // image empty check 
    if(images.length <= 0) {
        images = ratingReview.images  
    }

    // fetch user 
    const user = await User.findById(req.user._id)

    // update user 
    const createdRatingReview = await RatingReview.findByIdAndUpdate(ratingreviewId, {
        rating, 
        review, 
        images, 
        user
    }, {
        new: true 
    })

    // response return 
    return res.status(201)
        .json(new ApiResponse(200, createdRatingReview, "Feedback updated succesfully!"))

}) 

const deleteRatingReview = asyncHandler(async(req, res) => {
    // input from frontend 
    const { ratingreviewId } = req.params 
    const ratingReview = await RatingReview.findById(ratingreviewId)

    // field check 
    if(!ratingReview) {
        throw new ApiError(400, "No such feedback exists!")
    }

    // delete feedback from db 
    const deletedRatingReview = await RatingReview.findByIdAndDelete(ratingreviewId)

    // response return 
    if(deletedRatingReview) {
        return res.status(200, {}, "Feedback deleted succesfully!")
    } else {
        return res.status(200, {}, "Feedback already deleted!")
    }

})

const getProductRatingReviews = asyncHandler(async(req, res) => {
    // input from frontend 
    const { productId } = req.params 
    if(!productId) {
        throw new ApiError(400, "Product is missing to fetch feedback!")
    }

    // fetch product & user 
    const product = await Product.findById(productId)
    const user = await User.findById(req.user._id)

    // find user's feedback on product 
    const productRatingReview = await RatingReview.find({ 
        product, user 
    })

    // response return 
    return res.status(200) 
        .json(new ApiResponse(200, productRatingReview, "Feedback of product fetched succesfully!"))

})

const getUserAllRatingReviews = asyncHandler(async(req, res) => {
    // input from frontend 
    const user = await User.findById(req.user._id) 

    // fetch all user's feedback 
    const usersRatingReview = await RatingReview.find({ user })

    // response return 
    return res.status(200) 
        .json(new ApiResponse(200, usersRatingReview, "User's feedback fetched succesfully!"))
})

export { toggleUserWishlist, getUserWishlist, createRatingReview, updateRatingReview, deleteRatingReview, getProductRatingReviews, getUserAllRatingReviews }