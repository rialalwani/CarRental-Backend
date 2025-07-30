import express from "express"
import { sendEmail } from "../Service/SendingEmails.js"
import multer from "multer"

const routes=express.Router()
const upload=multer()
 
routes.post("/senddocs",upload.none(),sendEmail)

export default routes