import express from "express"
import { uploadimage, getImages,updateImage,updateImageData,deleteImage,updateAvailability } from "../Controllers/Cars.js"
import {verifytoken} from "../Middleware/user.js"
import { upload } from "../Middleware/fileupload.js"

const images_routes=express.Router()

images_routes.post("/uploadimage",verifytoken,upload.single("file"),uploadimage)
images_routes.get("/getimages",getImages)
images_routes.put("/updateImage",verifytoken,upload.single("file"),updateImage)
images_routes.put("/updateImageData",verifytoken,updateImageData)
images_routes.delete("/deleteImage",verifytoken,deleteImage)
images_routes.put("/updateAvailability",verifytoken,updateAvailability)

export default images_routes