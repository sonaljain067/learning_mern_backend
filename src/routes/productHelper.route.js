import Router from "express" 
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createProductAttribute, createProductDetails, deleteProductAttribute, deleteProductDetails, fetchProductAttributes, fetchAllProductDetails, updateProductAttribute, updateProductDetails } from "../controllers/productHelper.controller.js"

const router = Router() 

router.use(verifyJWT)

// TODO: testing below routes
router.route("/a")
    .post(createProductAttribute)
    

router.route("/a/:attributeId")
    .get(fetchProductAttributes)
    .patch(updateProductAttribute)
    .delete(deleteProductAttribute) 

router.route("/d/")
    
router.route("/d/:productId")
    .post(createProductDetails)
    .get(fetchAllProductDetails)
    
router.route("/ud/:productDetId")
    .patch(updateProductDetails)
    .delete(deleteProductDetails)

export default router 