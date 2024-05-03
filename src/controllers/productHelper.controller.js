import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Product } from "../models/product.model.js"
import { ProductAttribute } from "../models/productAttribute.model.js"
import { ProductDetails } from "../models/productDetail.model.js"

const createProductAttribute = asyncHandler(async(req, res) => {
    const { type, value } = req.body 
    if(!type) {
        throw new ApiError(400, "Type is required to create!")
    }
    if(!value) {
        throw new ApiError(400, "Value is required to create!")
    }

    const attributeExists = await ProductAttribute.findOne({ type }) 
    if(attributeExists) {
        throw new ApiError(401, "Attribute already exists!")
    }

    const createdAttribute = await ProductAttribute.create({
        type, 
        value 
    })

    return res.status(200)
        .json(new ApiResponse(200, createdAttribute, "Attribute created succesfully!"))
})

const fetchProductAttributes = asyncHandler(async(req, res) => {
    const { attributeId } = req.params 
    if(!attributeId) {
        throw new ApiError(400, "Attribute is required to fetch!")
    }
    const attribute = await ProductAttribute.findById(attributeId)
    if(!attribute) {
        throw new ApiError(404, "No such attribute exists!")
    } 

    return res.status(200)
        .json(new ApiResponse(200, attribute, "Attribute fetched succesfully!"))
})

const updateProductAttribute = asyncHandler(async(req, res) => {
    const { attributeId } = req.params 
    const { type, value } = req.body 
    if(!attributeId) {
        throw new ApiError(400, "Attribute is required to update!")
    }
    if(!type) {
        throw new ApiError(400, "Type is required to create!")
    }
    if(!value) {
        throw new ApiError(400, "Value is required to create!")
    }

    const attributeExists = await ProductAttribute.findById(attributeId)
    if(!attributeExists) {
        throw new ApiError(404, "No such attribute exists!")
    }

    const updatedAttribute = await ProductAttribute.findByIdAndUpdate(attributeId, {
        $set: {
            type, 
            value 
        }
    })

    return res.status(200)
        .json(new ApiResponse(200, updatedAttribute, "Attribute created succesfully!"))
})

const deleteProductAttribute = asyncHandler(async(req, res) => {
    const { attributeId } = req.params 
    if(!attributeId) {
        throw new ApiError(400, "Attribute is required to fetch!")
    }

    const deletedAttribute = await ProductAttribute.findByIdAndDelete(attributeId)

    if(deletedAttribute){
        return res.status(200)
        .json(new ApiResponse(200, {}, "Attribute deleted succesfully!"))
    } else {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Attribute already deleted!"))
    }
})

const createProductDetails = asyncHandler(async(req, res) => {
    const { productId } = req.params 
    const { size, color, price, qty } = req.body 

    if(!productId) {
        throw new ApiError(400, "Product is required to create details!")
    }

    if(!(price && qty && size && color)) {
        throw new ApiError(400, "All fields are required to create product details!")
    }

    const productSize = await ProductAttribute.findOne({ value: size })
    
    const productColor = await ProductAttribute.findOne({ value: color })

    if(!productType) {
        throw new ApiError(404, "No such type exists!")
    }
    if(price <= 0) {
        throw new ApiError(400, "Price should be greater than 0!")
    } 

    const createdDetails = await ProductDetails.create({
        productType, 
        productSize,
        productColor, 
        price, 
        qty 
    })

    return res.status(200)
        .json(new ApiResponse(200, createdDetails, "Product details created succesfully!"))

})

const updateProductDetails = asyncHandler(async(req, res) => {
    const { productId } = req.params 
    if(!productId) {
        throw new ApiError(400, "Product is required to fetch product details!")
    }

    const { size, color, price, qty } = req.body 
    if(!(size || color || price || qty)) {
        throw new ApiError(400, "Details cannot be empty to update product details!")
    }

    const product = await Product.findById(productId)
    if(!product) {
        throw new ApiError(404, "No such product exists!")
    } 

    const productDetail = await ProductDetails.findOne({ product })
    if(!productDetail) {
        throw new ApiError(404, "No such product details exists!")
    }

    const productSize = await ProductAttribute.find({ type: "size", value: size }) 

    const productColor = await ProductAttribute.find({ type: "color", value: color }) 

    // if(!productSize) {
    //     productSize = productDetail.productSize
    // }
    // if(!productColor) {
    //     productColor = productDetail.productColor
    // }
    // if(!price) {
    //     price = productDetail.price 
    // }
    // if(!qty) {
    //     qty = productDetail.qty 
    // }

    const updatedProductDetails = await ProductDetails.findByIdAndUpdate(productDetail._id, {
        $set: {
            productSize, 
            productColor, 
            price, 
            qty, 
        }
    })
    
    return res.status(200)
        .json(new ApiResponse(200, updatedProductDetails, "Attribute fetched succesfully!"))
})

const fetchProductDetails = asyncHandler(async(req, res) => {
    const { productId } = req.params 
    if(!productId) {
        throw new ApiError(400, "Product is required to fetch product details!")
    }

    const product = await Product.findById(productId)
    if(!product) {
        throw new ApiError(404, "No such product exists!")
    } 

    const productDetail = await ProductDetails.findOne({ product })
    if(!productDetail) {
        throw new ApiError(404, "No such product details exists!")
    }

    if(productDetail) {
        return res.status(200)
            .json(new ApiResponse(200, productDetail, "Product details fetched succesfully!"))
    } else {
        return res.status(200)
            .json(new ApiResponse(200, {}, "No product details exists with provided product Id!"))
    }


})

const deleteProductDetails = asyncHandler(async(req, res) => {
    const { productId } = req.params 
    if(!productId) {
        throw new ApiError(400, "Product is required to fetch product details!")
    }

    const product = await Product.findById(productId)
    if(!product) {
        throw new ApiError(404, "No such product exists!")
    } 

    const deletedProduct = await ProductDetails.findByIdAndDelete({ product })
    
    if(deletedProduct) {
        return res.status(200)
            .json(new ApiResponse(200, {}, "Product Details deleted succesfully!"))
    } else {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Product Details already deleted!"))
    }
})


export { createProductAttribute, fetchProductAttributes, updateProductAttribute, deleteProductAttribute, createProductDetails, fetchProductDetails, updateProductDetails, deleteProductDetails }