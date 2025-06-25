import express from "express"
import { sendotp,verifyotp,resetPassword } from "../Controllers/password-reset.js"

const routes=express.Router()

routes.post("/sendotp",sendotp)
routes.post("/verifyotp",verifyotp)
routes.post("/reset-password",resetPassword)

export default routes
