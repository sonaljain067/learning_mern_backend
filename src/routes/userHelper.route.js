import Router from "express" 
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createRatingReview, deleteRatingReview, getProductRatingReviews, getUserAllRatingReviews, getUserWishlist, toggleUserWishlist, updateRatingReview } from "../controllers/userHelper.controller.js"

const router = Router() 

router.use(verifyJWT)

router.route("/wishlist")
    .get(getUserWishlist)

router.route("/wishlist/:productId")
    .post(toggleUserWishlist)

router.route("/feedback/:productId")
    .post(upload.array("images", 3), createRatingReview) 
    .get(getProductRatingReviews)
    .patch(upload.array("images", 3), updateRatingReview)
    .delete(deleteRatingReview)

router.route("/feedback")
    .get(getUserAllRatingReviews)


export default router 