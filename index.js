import express from "express"
import cors from "cors"
import cloudinary from "cloudinary"
import dotenv from "dotenv"
import user from "./Routes/user.js"
import { mongoose } from "mongoose"
import resetPassword from "./Routes/passwordreset.js"
import images from "./Routes/images.js"
import http from "http"
import { Server } from "socket.io"
import CarBookings from "./Controllers/Bookings.js"
import Socket from "./Middleware/socket.js"
import bookingRoutes from "./Routes/Bookings.js"
import scheduler from "./Scheduler.js"
import sendEmailRoutes from "./Routes/SendDocuments.js"
import paymentRoutes from "./Routes/Payment.js"

dotenv.config()
const app = express()
app.use(cors({
    origin: "https://car-rental-frontend-b4epna7n0-ria-lalwanis-projects.vercel.app/",
}))
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Hello,AMR Car Rental")
})



app.use("/user", user)
app.use("/forget-password", resetPassword)
app.use("/cars", images)
app.use("/bookings", bookingRoutes)
app.use("/email", sendEmailRoutes)
app.use("/payment", paymentRoutes)

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "http://localhost:3000" }, methods: ["GET", "POST"], credentials: true })


cloudinary.config({
    cloud_name: process.env.CLOUD,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})



mongoose.connect(process.env.DB_URL).then(() => {
    console.log("Database connected")

}).
    catch((err) => console.log(err.message))

io.use(Socket)
CarBookings(io)
scheduler()

server.listen(5000, () => {
    console.log("Server running on port 5000")
})


