import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Product } from "../models/product.model.js"
import { ProductAttribute } from "../models/productAttribute.model.js"
import { ProductDetail } from "../models/productDetail.model.js"

const createProductAttribute = asyncHandler(async(req, res) => {
    // input from frontend 
    const { type, value } = req.body 

    // input check 
    if(!type) {
        throw new ApiError(400, "Type is required to create!")
    }
    if(!value) {
        throw new ApiError(400, "Value is required to create!")
    }

    // attribute exists check 
    const attributeExists = await ProductAttribute.findOne({ value }) 
    if(attributeExists) {
        throw new ApiError(401, "Attribute already exists!")
    }

    // attribute creation 
    const createdAttribute = await ProductAttribute.create({
        type, 
        value 
    })

    // response return 
    return res.status(200)
        .json(new ApiResponse(200, createdAttribute, "Attribute created succesfully!"))
})

const fetchProductAttributes = asyncHandler(async(req, res) => {
    // input from frontend 
    const { attributeId } = req.params 

    // input check 
    if(!attributeId) {
        throw new ApiError(400, "Attribute is required to fetch!")
    }

    // fetch attribute 
    const attribute = await ProductAttribute.findById(attributeId)
    if(!attribute) {
        throw new ApiError(404, "No such attribute exists!")
    } 

    // response return 
    return res.status(200)
        .json(new ApiResponse(200, attribute, "Attribute fetched succesfully!"))
})

const updateProductAttribute = asyncHandler(async(req, res) => {
    // input from frontend
    const { attributeId } = req.params 
    const { type, value } = req.body 

    // input check 
    if(!attributeId) {
        throw new ApiError(400, "Attribute is required to update!")
    }
    if(!type) {
        throw new ApiError(400, "Type is required to update!")
    }
    if(!value) {
        throw new ApiError(400, "Value is required to update!")
    }

    // attribute fetch 
    const attributeExists = await ProductAttribute.findById(attributeId)
    if(!attributeExists) {
        throw new ApiError(404, "No such attribute exists!")
    }

    // attribute updation 
    const updatedAttribute = await ProductAttribute.findByIdAndUpdate(attributeId, {
        $set: {
            type, 
            value 
        }
    }, {
        new: true
    })

    // response return 
    return res.status(200)
        .json(new ApiResponse(200, updatedAttribute, "Attribute created succesfully!"))
})

const deleteProductAttribute = asyncHandler(async(req, res) => {    
    // input from frontend 
    const { attributeId } = req.params 
    
    // input check 
    if(!attributeId) {
        throw new ApiError(400, "Attribute is required to fetch!")
    }

    // attribute deletion 
    const deletedAttribute = await ProductAttribute.findByIdAndDelete(attributeId)

    // response return 
    if(deletedAttribute){
        return res.status(200)
        .json(new ApiResponse(200, {}, "Attribute deleted succesfully!"))
    } else {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Attribute already deleted!"))
    }
})

const createProductDetails = asyncHandler(async(req, res) => {
    // input from frontend 
    const { productId } = req.params 
    const { size, color, price, qty } = req.body 

    // input check
    if(!productId) {
        throw new ApiError(400, "Product is required to create details!")
    }
    if(!(price && qty && size && color)) {
        throw new ApiError(400, "All fields are required to create product details!")
    }

    // product fetch 
    const product = await Product.findById(productId) 
    if(!product) {
        throw new ApiError(400, "No such product exists!")
    }

    // color & size attribute fetch 
    let productSize = await ProductAttribute.findOne({ 
        type: "size", value: size 
    })
    
    let productColor = await ProductAttribute.findOne({ 
        type: "color", value: color 
    })

    // creation if color & size doesn't exist 
    if(!productSize) {
        productSize = await ProductAttribute.create({ 
            type: "size", value: size 
        })
    }
    if(!productColor) {
        productColor = await ProductAttribute.create({ 
            type: "color", value: color
        })
    }

    // < 0 price check 
    if(price <= 0) {
        throw new ApiError(400, "Price should be greater than 0!")
    }   

    // detail exist check 
    const isProductDetailExists = await ProductDetail.find({
        product, 
        productSize, 
        productColor, 
        price, 
        qty 
    })  

    // response return 
    if(isProductDetailExists.length > 0){
        throw new ApiError(400, "Product details already exists!")
    } else {
        const createdDetails = await ProductDetail.create({
            product,
            productSize,
            productColor, 
            price, 
            qty 
        })
        return res.status(200)
            .json(new ApiResponse(200, createdDetails, "Product details created succesfully!"))
    }
})

const updateProductDetails = asyncHandler(async(req, res) => {
    // input from frontend 
    const { productDetId } = req.params 
    let { size, color, price, qty } = req.body 

    // input check 
    if(!productDetId) {
        throw new ApiError(400, "Product is required to fetch product details!")
    }
    if(!(size || color || price || qty)) {
        throw new ApiError(400, "Details cannot be empty to update product details!")
    }

    // fetch product detail 
    const productDetail = await ProductDetail.findById(productDetId)
    if(!productDetail) {
        throw new ApiError(404, "No such product details exists!")
    }

    // fetch size & color 
    let productSize = await ProductAttribute.findOne({ 
        type: "size", value: size 
    }) 
    let productColor = await ProductAttribute.findOne({ type: "color", value: color }) 

    // creation if color & size doesn't exist 
    if(!productSize) {
        productSize = await ProductAttribute.create({
            type: "size", value: size
        })
    }
    if(!productColor) {
        productColor = await ProductAttribute.create({
            type: "color", value: color
        })
    }

    // product detail updation 
    const updatedProductDetails = await ProductDetail.findByIdAndUpdate(productDetId, {
        $set: {
            productSize, 
            productColor, 
            price, 
            qty
        }
    }, {
        new: true 
    })

    // response return 
    return res.status(200)
        .json(new ApiResponse(200, updatedProductDetails, "Attribute updated succesfully!"))
})

const fetchAllProductDetails = asyncHandler(async(req, res) => {
    // input from frontend 
    const { productId } = req.params 

    // field check 
    if(!productId) {
        throw new ApiError(400, "Product is required to fetch product details!")
    }

    // product fetch 
    const product = await Product.findById(productId)
    if(!product) {
        throw new ApiError(404, "No such product exists!")
    } 

    // list of product details of product fetch 
    const productDetails = await ProductDetail.find({ product })

    // response return 
    return res.status(200)
        .json(new ApiResponse(200, productDetails, "Product details fetched succesfully!"))

})

const deleteProductDetails = asyncHandler(async(req, res) => {
    // input from frontend 
    const { productDetId } = req.params 
    
    // field check 
    if(!productDetId) {
        throw new ApiError(400, "Product Detail is required to delete it!")
    }

    // product detail deletion 
    const deletedProduct = await ProductDetail.findByIdAndDelete(productDetId)

    // response return 
    if(deletedProduct) {
        return res.status(200)
            .json(new ApiResponse(200, {}, "Product Details deleted succesfully!"))
    } else {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Product Details already deleted!"))
    }
})


export { createProductAttribute, fetchProductAttributes, updateProductAttribute, deleteProductAttribute, createProductDetails, fetchAllProductDetails, updateProductDetails, deleteProductDetails }