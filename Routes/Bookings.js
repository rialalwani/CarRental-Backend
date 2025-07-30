import express from "express"
import {getMyBookings,getAllBookings} from "../Controllers/MyBookings.js"
import { getAllCancelledBookings,getMyCancelledBookings } from "../Controllers/CancelledBookings.js"
import {verifytoken} from "../Middleware/user.js"

const bookingRoutes=express.Router()

bookingRoutes.get("/mybookings",verifytoken,getMyBookings)
bookingRoutes.get("/allbookings",verifytoken,getAllBookings)
bookingRoutes.get("/mycancelledbookings",verifytoken,getMyCancelledBookings)
bookingRoutes.get("/allcancelledbookings",verifytoken,getAllCancelledBookings)

export default bookingRoutes