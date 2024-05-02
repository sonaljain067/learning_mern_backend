import Router from "express" 
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { addProduct, deleteProduct, fetchAllProducts, fetchProduct, productByCategory, productBySubCategory, updateProduct } from "../controllers/product.controller.js"

const router = Router() 

router.use(verifyJWT)

router.route("/")
    .post(
        upload.fields([
            {
                name: "coverImage",
                maxField: 1
            }, 
            {
                name: "images",
                maxField: 10
            }
        ]),
        addProduct
    )
    .get(fetchAllProducts)

router.route("/:productId")
    .get(fetchProduct)
    .patch(updateProduct)
    .delete(deleteProduct)

router.route("/c/:categoryId")
    .get(productByCategory)

router.route("/s/:subCategoryId")
    .get(productBySubCategory)

export default router 