import Router from "express" 
import { addAnAddress, deleteUserAddress, fetchAnAddress, fetchUsersAddresses, updateAnAddress } from "../controllers/address.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT) 

router.route("/")
    .post(addAnAddress)
    .get(fetchUsersAddresses)


router.route("/:addressId")
    .get(fetchAnAddress)
    .patch(updateAnAddress)
    .delete(deleteUserAddress)

export default router 