import express from "express"
import { sendotp,verifyotp,login, getAllUsers, completeYourProfile } from "../Controllers/login.js"
import { verifytoken } from "../Middleware/user.js"

const user_routes=express.Router()

user_routes.post("/sendotp",sendotp)
user_routes.post("/verifyotp",verifyotp)
user_routes.post("/login",login)
user_routes.get("/allusers",verifytoken,getAllUsers)
user_routes.put("/completeProfile",verifytoken,completeYourProfile)

export default user_routes