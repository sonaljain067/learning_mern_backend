import Router from "express" 
import { createProductAttribute, createProductDetails, deleteProductAttribute, deleteProductDetails, fetchProductAttributes, fetchProductDetails, updateProductAttribute, updateProductDetails } from "../controllers/productHelper.controller"

const router = Router() 

router.use(verifyJWT)

router.route("/a/:attributeId")
    .post(createProductAttribute)

router.route("/a")
    .get(fetchProductAttributes)
    .patch(updateProductAttribute)
    .delete(deleteProductAttribute)

router.route("/d/:productId")
    .post(createProductDetails)

router.route("/d")
    .get(fetchProductDetails)
    .patch(updateProductDetails)
    .delete(deleteProductDetails)

export default router 