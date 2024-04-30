import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError }from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Category } from "../models/category.model.js"
import { Subcategory } from "../models/subcategory.model.js"

const createCategory = asyncHandler(async(req, res) => {
    // fetching from frontend 
    const { name, description } = req.body 

    // null value check 
    if(!name) {
        throw new ApiError(409, "Category name is required!")
    }

    // duplicate check
    const category = await Category.find({ name })
    if(category) {
        throw new ApiError(409, "Category already exists!")
    }

    // creating category 
    const createdCategory = await Category.create({
        name, 
        description: description || ""
    })

    // returing response 
    return res.status(201)
        .json(new ApiResponse(200, createdCategory, "Category created successfully!"))
})

const updateCategory = asyncHandler(async(req, res) => {
    // fetching from frontend 
    let { name, description } = req.body 
    const { categoryId } = req.params 
    
    // null check
    if(!categoryId) {
        throw new ApiError(401, "Category is required to update!")
    }

    // fetching category 
    const category = await Category.findById(categoryId)

    // updating category 
    const updatedCategory = await Category.findByIdAndUpdate(category._id, {
        $set: {
            name, 
            description
        }
    }, {
        new: true
    })
    
    // returing response 
    return res.status(200)
        .json(new ApiResponse(200, updatedCategory, "Category updated successfully!"))
})

const fetchAllCategory = asyncHandler(async(req, res) => {
    // fetching all categories 
    const categories = await Category.find()

    // returing response 
    return res.status(200)
        .json(new ApiResponse(200, categories, "All categories fetched succesfully!"))
})

const deleteCategory = asyncHandler(async(req, res) => {
    // fetching from frontend 
    const { categoryId } = req.params 

    // null check 
    if(!categoryId) {
        throw new ApiError(401, "Category is required to delete!")
    }

    // deleting category 
    const deletedCategory = await Category.findByIdAndDelete(categoryId) 

    // returing response 
    if(deletedCategory){
        return res.status(200)
        .json(new ApiResponse(200, {}, "Category deleted succesfully!"))
    } else {
        return res.status(200)
        .json(new ApiResponse(200, {}, "Category already deleted!"))
    }
})

const createSubCategory = asyncHandler(async(req, res) => {
    // fetching from frontend  
    const { categoryId } = req.params 
    const { name, description } = req.body 

    // null value check 
    if(!name) {
        throw new ApiError(409, "Sub Category name is required!")
    }

    // category exists check 
    const category = await Category.findById(categoryId)
    if(!category) {
        throw new ApiError(409, "Category doesn't exist!")
    }

    // name exists check 
    const subcategory = await Subcategory.find({ name })
    if(subcategory) {
        throw new ApiError(409, "Sub category already exists!")
    }

    // creating subcategory in db 
    const createdSubCategory = await Subcategory.create({
        name, 
        description,
        category
    })

    // returing response 
    return res.status(201)
        .json(new ApiResponse(200, createdSubCategory, "Category created successfully!"))
})

const updateSubCategory = asyncHandler(async(req, res) => {
    // fetching from frontend 
    let { name, description } = req.body 
    const { subcategoryId } = req.params 
    
    // subcategory existing check 
    const subCategory = await Subcategory.findById(subcategoryId)
    if(!subCategory) {
        throw new ApiError(409, "Subcategory to update is missing!")
    }

    // updating subcategory in db 
    const updatedSubCategory = await Subcategory.findByIdAndUpdate(subCategory._id, {
        $set: {
            name, 
            description
        }
    }, {
        new: true
    })

    // returing response 
    return res.status(200)
        .json(new ApiResponse(200, updatedSubCategory, "Sub Category updated successfully!"))
})

const fetchCategorySubCategory = asyncHandler(async(req, res) => {
    // fetching from frontend 
    const { categoryId } = req.params
    
    // fetching category 
    const category = await Category.findById(categoryId)

    // fetching all subcategories of a category 
    const subCategories = await Subcategory.find({
        category
    })

    // returning response 
    return res.status(200)
        .json(new ApiResponse(200, subCategories, "All categories fetched succesfully!"))
})

const deleteSubCategory = asyncHandler(async(req, res) => {
    // fetching from frontend 
    const { subcategoryId } = req.params 

    if(!subcategoryId) {
        throw new ApiError(401, "Sub Category is required to delete!")
    }
    
    // deleting category 
    const deletedSubCategory = await Subcategory.findByIdAndDelete(subcategoryId) 

    // returing response 
   if(deletedSubCategory){
    return res.status(200)
    .json(new ApiResponse(200, {}, "Sub Category deleted succesfully!"))
   } else {
    return res.status(200)
        .json(new ApiResponse(200, {}, "Sub Category already deleted!"))
   }
})

export { createCategory, updateCategory, fetchAllCategory, deleteCategory, createSubCategory, updateSubCategory, fetchCategorySubCategory, deleteSubCategory}

