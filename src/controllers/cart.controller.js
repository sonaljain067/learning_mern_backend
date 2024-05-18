import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Cart } from "../models/cart.model.js"
import { User } from "../models/user.model.js"
import { Product } from "../models/product.model.js"
import { ProductDetail } from "../models/productDetail.model.js"

const addToCart = asyncHandler(async(req, res) => {
    // input from frontend 
    let { productId, productDetId, qty = 1 } = req.body 

    // fields check 
    if(!productId) {
        throw new ApiError(409, "Product is required to add to cart!")
    }
    if(!productDetId) {
        throw new ApiError(409, "Product details are required to add to cart!")
    }

    // fetch user 
    const userId = await req.user
    const user = userId._id

    // fetch product 
    const product = await Product.findById(productId)
    if(!product) {
        throw new ApiError(404, "No such product exists!")
    }

    // fetch product details 
    const productDet = productDet = await ProductDetail.findById(productDetId) 

    if(!productDet) {
        throw new ApiError(404, "No product details exists!")
    }
    if(qty == 0) qty = 1; 

    // fetch product from cart 
    const cart = await Cart.find({
        user, productDet 
    })

    // product exists return product 
    if(cart.length >= 1) {
        return res.status(200)
            .json(new ApiResponse(200, cart, "Cart fetched succesfully!"))
    } else {
        // creating product in cart 
        const createdCart = await Cart.create({
            user, 
            product, 
            productDet,
            qty 
        })

        // returning response 
        return res.status(200)
            .json(new ApiResponse(200, createdCart, "Cart created succesfully!"))
    }
})  

const fetchAnCart = asyncHandler(async(req, res) => {
    // input from frontend 
    const { productDetId } = req.params 

    // fetch user 
    const userId = await req.user
    const user = userId._id

    // get cart 
    const cart = await Cart.findOne({ productDet: productDetId, user })

    // returing response
    if(cart) {
        return res.status(200)
        .json(new ApiResponse(200, cart, "Cart fetched succesful!"))
    } else {
        return res.status(200)
        .json(new ApiResponse(200, cart, "No such product exists!"))
    }
})

const fetchUsersCart = asyncHandler(async(req, res) => {
    // fetch user 
    const userId = await req.user 
    const user = await User.findById(userId)

    // fetch user cart 
    const userCart = await Cart.find({ user })

    // returing response
    return res.status(200)
    .json(new ApiResponse(200, userCart, "User Cart fetched succesfully!"))
}) 

const updateAnCart = asyncHandler(async(req, res) => {
    // input from frontend 
    let { productId, qty } = req.body 

    // cart fetch 
    const { productDetId } = req.params 

    // field check 
    if(!productDetId){
        throw new ApiError(409, "Product details are missing to update!")
    }

    if(!productId) {
        throw new ApiError(409, "Product is required to add to cart!")
    }

    // fetch user 
    const userId = await req.user
    const user = userId._id 

    // fetch product 
    const product = await Product.findById(productId)
    if(!product) {
        throw new ApiError(404, "No such product exists!")
    }

    // fetch product details 
    const productDet = await ProductDetail.findById(productDetId)
    if(!productDet) {
        throw new ApiError(404, "No product details exists!")
    }

    // fetching cart 
    const cart = await Cart.findOne({ productDet: productDetId, user })

    if(!cart){
        await Cart.create({
            product, productDet, qty, user 
        })
    }

    if(qty >= 1) {
        // updating cart fields
        const updatedCart = await Cart.findOneAndUpdate({productDet: productDetId}, {
            $set: {
                product, 
                productDet, 
                qty 
            }
        }, {
            new: true
        })
        // returning response 
        return res.status(200)
            .json(new ApiResponse(200, updatedCart, "Cart updated succesfully!"))
    } else {
        // deleting product details when qty = 0 
        await Cart.findOneAndDelete({ productDet: productDetId })
        .then(async cart => {
            if(cart) {
                // deleted response
                return res.status(200)
                    .json(new ApiResponse(200, {}, "Order deleted succesfully!"))
            } else {
                // already deleted response 
                return res.status(200)
                    .json(new ApiResponse(200, {}, "Order already deleted!"))
            }
        })
    }
})

export { addToCart, fetchAnCart, updateAnCart, fetchUsersCart }