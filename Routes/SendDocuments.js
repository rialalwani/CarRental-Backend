import express from "express"
import { sendEmail } from "../Service/SendingEmails.js"
import multer from "multer"
import { upload } from "../Middleware/AdhaarAndDl.js"

const routes=express.Router()
 
routes.post("/senddocs",upload,sendEmail) 

export default routes