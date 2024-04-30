import Router from "express" 
import { createCategory, createSubCategory, deleteCategory, deleteSubCategory, fetchAllCategory, fetchCategorySubCategory, updateCategory, updateSubCategory } from "../controllers/category.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/")
    .post(createCategory)
    .get(fetchAllCategory)

router.route("/:categoryId/")
    .patch(updateCategory)
    .delete(deleteCategory)

router.route("/sub/:categoryId")
    .post(createSubCategory)
    .get(fetchCategorySubCategory)

router.route("/sub/:subcategoryId")
    .patch(updateSubCategory)
    .delete(deleteSubCategory)

export default router 