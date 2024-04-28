import Router from "express" 
import { addAnAddress, deleteUserAddress, fetchAnAddress, fetchUsersAddresses, updateAnAddress } from "../controllers/address.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/")
    .post(verifyJWT, addAnAddress)
    .get(verifyJWT, fetchUsersAddresses)


router.route("/:addressId")
    .get(verifyJWT, fetchAnAddress)
    .patch(verifyJWT, updateAnAddress)
    .delete(verifyJWT, deleteUserAddress)

export default router 