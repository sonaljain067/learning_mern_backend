import Router from "express" 
import { createArtisan, deleteArtisan, fetchAllArtisan, fetchAnArtisan, updateArtisan, updateLogo } from "../controllers/artisan.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/")
    .post(upload.single("logo"), createArtisan)
    .get(fetchAllArtisan)

router.route("/:artisanId")
    .get(fetchAnArtisan)
    .put(updateArtisan)
    .delete(deleteArtisan)
    .patch(upload.single("logo"), updateLogo)

export default router 