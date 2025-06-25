import express from "express"
import {getMyBookings} from "../Controllers/MyBookings.js"
import {verifytoken} from "../Middleware/user.js"

const bookingRoutes=express.Router()

bookingRoutes.get("/mybookings",verifytoken,getMyBookings)

export default bookingRoutes