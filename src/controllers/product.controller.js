import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

import { Product } from "../models/product.model.js"
import { Artisan } from "../models/artisan.model.js"
import { User } from "../models/user.model.js"
import { Subcategory } from "../models/subcategory.model.js"
import { Category } from "../models/category.model.js"
import { WatchHistory } from "../models/watchHistory.model.js"
import { ProductDetail } from "../models/productDetail.model.js"

const addProduct = asyncHandler(async(req, res) => {
    // input from frontend 
    const { subCategoryName, name, description } = req.body 

    // fields empty check 
    if([ subCategoryName, name, description ].some((field) => field?.trim() === "")) {
        throw new ApiError(409, "All fields are required to add product!")
    }   

    // cover image upload check 
    const coverImageLocalPath = req.files?.coverImage[0]?.path 
    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is required!!")
    }
    
    // images upload check 
    const imagesLocalPath = req.files?.images 
    if(!imagesLocalPath) {
        throw new ApiError(400, "Product images are required!")
    }

    // images limit check 
    if(req.files?.images.length > 10) {
        throw new ApiError(400, "Only 10 images are allowed to be uploaded for product!")
    }

    // fetching subcategory 
    const subcategory = await Subcategory.findOne({ name: subCategoryName })
    if(!subcategory) {
        throw new ApiError(401, "Incorrect Subcategory!") 
    }

    // uploading cover image 
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage) {
        throw new ApiError(500, "Failed to upload cover image to server!")
    }

    // uploading images to cloudinary 
    const images = []
    const imagesArr = []
    const uploadPromise = imagesLocalPath.map(async(field) => {
        const image = await uploadOnCloudinary(field.path)
        imagesArr.push(image)
    })
    await Promise.all(uploadPromise) 

    imagesArr.map((field) => {
        if(field){
            images.push(field.secure_url)
        }
    })
    if(images.length <= 0) {
        throw new ApiError(500, "Failed to upload images to server!")
    }

    // fetching artisan 
    const userId = await req.user
    const user = await User.findOne({ _id: userId._id })
    const artisan = await Artisan.findOne({ user })

    // creating product in db
    const createdProduct = await Product.create({
        subcategory,
        name, 
        description, 
        coverImage: coverImage?.secure_url,
        images, 
        artisan 
    })

    // returning response 
    return res.status(200)
        .json(new ApiResponse(200, createdProduct, "Product created succesfully!"))

})  

const fetchProduct = asyncHandler(async(req, res) => {
    // input from frontend 
    const { productId } = req.params 
    if(!productId){
        throw new ApiError(401, "Product is required to fetch!")
    }

    // get product & user from db 
    const user = await req.user 
    const product = await Product.findById(productId)

    // user already viewed product check 
    const isAlreadyWatchedByUser = await WatchHistory.findOne({
        user, 
        product
    })

    // deletion of old view of product
    if(isAlreadyWatchedByUser){
        await WatchHistory.findByIdAndDelete(isAlreadyWatchedByUser._id)
    } 
    
    // creation of product view by user 
    await WatchHistory.create({
        user, 
        product
    })
    
    // returing response
    return res.status(200)
        .json(new ApiResponse(200, product, "Product fetched succesful!"))
     
})

const fetchAllProducts = asyncHandler(async(req, res) => {
    // input from frontend 
    let { sortType, query, page = 1, limit = 10 } = req.query

    // if sortType is not selected 
    let sortList = ["priceL", "priceH", "bestseller", "rating", "createdAt"]
    if(!(sortList.includes(sortType))) {
        sortType = "bestseller" 
    }

    // selection of sortBy from sortType 
     // let sort =  [{"bestseller": -1}, {"priceH": -1}, {"priceL": 1}, {"createdAt": -1}, {"rating": 1}]
    let sortBy = -1
    if(sortType == "priceL") {
        sortType = "price"
        sortBy = 1 
    } else if(sortBy == "rating") {
        sortBy = 1
    } else if(sortType == "priceH") {
        sortType = "price"
    }
    
    // sortType & sortBy set for sorting 
    let dynamicSort = {}
    dynamicSort[sortType] = sortBy

    // aggregation pipeline 
    const allProductDetails = await Product.aggregate([
        // table join 
        {
            $lookup: {
                from: "productdetails",
                localField: "_id",
                foreignField: "product",
                as: "productDet"
            }
        },
        // searching by name 
        {
            $match: {
                name: {
                    $regex: query || ""
                }
            }
        },
        // dynamic sorting 
        {
            $sort: dynamicSort
        }
    ])

    // response return 
    return res.status(200) 
        .json(new ApiResponse(200, allProductDetails, "All Products fetched succesfully!"))
})

const updateProduct = asyncHandler(async(req, res) => {
    // input from frontend 
    let { subCategoryName, name, description, bestseller, userRatings, userReviews } = req.body 

    // product Id check 
    let { productId } = req.params 
    if(!productId){
        throw new ApiError(401, "Product is required to update!")
    }

    // product exists check 
    const product = await Product.findById(productId)
    if(!product) {
        throw new ApiError(404, "Requested product doesn't exist!")
    }

    // empty value check 
    if(!(subCategoryName || name || description || bestseller || userRatings || userReviews)){
        throw new ApiError(409, "Details are required to update product!")
    }

    // subcategory fetch 
    let subcategory = await Subcategory.findOne({ name: subCategoryName })

    if(!subcategory) {
        subcategory = product.subcategory
    }

    let coverImage = ""
    let images = [] 

    // file upload check 
    if(req.files) {
        if(req.files?.coverImage[0]){
            // cover image local path fetch 
            const coverImageLocalPath = req.files?.coverImage[0]?.path

            // uploading cover image to server
            coverImage = await uploadOnCloudinary(coverImageLocalPath)
            if(!coverImage) {
                throw new ApiError(500, "Failed to upload cover image to server!")
            }
        }
        if(req.files.images) {
            // image local path fetch 
            const imagesLocalPath = req.files?.images 

             // images limit check 
            if(req.files?.images.length > 10) {
                throw new ApiError(400, "Only 10 images are allowed to be uploaded for product!")
            }

            // uploading images to server  
            const imagesArr = []
            const uploadPromise = imagesLocalPath.map(async(field) => {
                const image = await uploadOnCloudinary(field.path)
                imagesArr.push(image)
            })
            await Promise.all(uploadPromise) 

            // pushing server url to array 
            imagesArr.map((field) => {
                if(field){
                    images.push(field.secure_url)
                }
            })

            // empty array check 
            if(images.length <= 0) {
                throw new ApiError(500, "Failed to upload images to server!")
            }
        }
    }

    // null check from input 
    if(!coverImage) {
        coverImage = product.coverImage
    } 
    if(images.length <= 0){
        images = product.images 
    }
    if(!name) {
        name = product.name 
    }
    if(!description) {
        description = product.description 
    }

    // updating product fields
    const updatedProduct = await Product.findByIdAndUpdate(productId, {
        $set: {
            subcategory,
            name, 
            description,
            coverImage, 
            images,
            bestseller, 
            userRatings,
            userReviews
        }
    }, {
        new: true
    })

    // returning response 
    return res.status(200)
        .json(new ApiResponse(200, updatedProduct, "Product updated succesfully!"))
    
})

const deleteProduct = asyncHandler(async(req, res) => {
    // fetching from frontend 
    let { productId } = req.params 

    // product Id null check 
    if(!productId){
        throw new ApiError(401, "Product to delete is missing!")
    }

    const deletedProduct = await Product.findByIdAndDelete({ 
       _id: productId
    }) 

    // returing response 
    if(deletedProduct) {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Product deleted succesfully!"))
    } else {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Product already deleted!"))
    }
})

const productByCategory = asyncHandler(async(req, res) => {
    // data from frontend 
    let { categoryId } = req.params 

    // category Id null check 
    if(!categoryId){
        throw new ApiError(401, "Category to search product is missing!")
    }   

    // category fetch 
    const category = await Category.findById(categoryId) 

    // subcategories fetch 
    const subcategories = await Subcategory.find({ category })

    // products from db 
    const products = await Product.find({ subcategory: subcategories }) 

    // response
    return res.status(200)
        .json(new ApiResponse(200, products, "Product fetched succesful!"))

})
 
const productBySubCategory = asyncHandler(async(req, res) => {
    // data from frontend 
    let { subCategoryId } = req.params 

    // subcategory Id null check 
    if(!subCategoryId){
        throw new ApiError(401, "Category to search product is missing!")
    }

    // subcategory fetch 
    const subcategory = await Subcategory.findById(subCategoryId)

    // products from db 
    const products = await Product.find({ subcategory }) 

    // response
    return res.status(200)
        .json(new ApiResponse(200, products, "Product fetched succesful!"))
})

export { addProduct, fetchAllProducts, fetchProduct, updateProduct, deleteProduct, productByCategory, productBySubCategory }