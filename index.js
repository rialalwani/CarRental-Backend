import express from "express"
import cors from "cors"
import cloudinary from "cloudinary"
import dotenv from "dotenv"
import user from "./Routes/user.js"
import {mongoose} from "mongoose"
import resetPassword from "./Routes/passwordreset.js"
import images from "./Routes/images.js"
import http from "http"
import { Server } from "socket.io"
import CarBookings from "./Controllers/Bookings.js"
import Socket from "./Middleware/socket.js"
import bookingRoutes from "./Routes/Bookings.js"

dotenv.config()
const app=express()
app.use(cors())
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("Hello,AMR Car Rental")
})

mongoose.connect(process.env.DB_URL).then(()=>console.log("Database connected")).catch((err)=>console.log(err.message))

app.use("/user",user)
app.use("/forget-password",resetPassword)
app.use("/cars",images)
app.use("/bookings",bookingRoutes)

const server=http.createServer(app)
const io=new Server(server,{cors:{origin:"*"},methods:["GET","POST"]}) 
io.use(Socket)
CarBookings(io)

cloudinary.config({
    cloud_name:process.env.CLOUD,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

server.listen(5000,()=>{
    console.log("Server running on port 5000")
})


