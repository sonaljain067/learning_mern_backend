import Router from "express" 
import { addToCart, fetchAnCart, fetchUsersCart, updateAnCart } from "../controllers/cart.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router() 

router.use(verifyJWT) 

router.route("/")
    .get(fetchUsersCart)
    .post(addToCart)

router.route("/:productDetId")
    .get(fetchAnCart)
    .patch(updateAnCart)

export default router 