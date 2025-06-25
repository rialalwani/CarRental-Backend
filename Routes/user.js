import express from "express"
import { sendotp,verifyotp,login } from "../Controllers/login.js"

const user_routes=express.Router()

user_routes.post("/sendotp",sendotp)
user_routes.post("/verifyotp",verifyotp)
user_routes.post("/login",login)

export default user_routes