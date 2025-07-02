import Bookings from "../Models/Bookings.js"
import CarImages from "../Models/image.js"
import admin from "firebase-admin"
import serviceAccount from "../../../../../Downloads/car-rental-68d5f-firebase-adminsdk-fbsvc-331f56efb0.json" assert {type:"json"}
import User from "../Models/user.js"
import dotenv from "dotenv"

dotenv.config()

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

let ownerSocketId = null
const userSocketId = new Map()

const CarBookings = (io) => {

  io.on("connection", async (socket) => {

    console.log("user connected", socket.id)
    const { email, userType } = socket.user
    console.log("userType", userType)
    const { fcmToken } = socket
    if (userType == "owner") {
      ownerSocketId = socket.id
    }
    else if (userType == "verified-user")
      userSocketId.set(email, socket.id)

    const user = await User.findOne({ email })
    user.fcmToken = fcmToken
    await user.save();
    console.log("FCM Token saved:", user.fcmToken)
    //console.log("Owner Socket ID:", ownerSocketId)

    socket.on("booking", async (bookingDetails) => {
      try {
        console.log("working")
        const booking = new Bookings(bookingDetails)
        await booking.save();
        const { carId } = booking
        const car = await CarImages.findOne({ _id: carId })
        car.availability = "Booked"
        await car.save()
        console.log(car.availability)

        socket.emit("bookingCompleted", { message: "Booking done" })
        console.log(ownerSocketId)

        const { userEmail } = bookingDetails
        const user = await User.findOne({ email: userEmail })
        const notification = `Car:${car.carname}\n
                            From ${bookingDetails.bookingStartDate}-To ${bookingDetails.bookingEndDate}\n
                            Customer Phone NUmber ${user.phoneNumber} \n
                            Earnings ${bookingDetails.bookingCharges}`


        if (ownerSocketId) {
          io.to(ownerSocketId).emit("New Booking", { message: notification })
          console.log("sent")
        }
        else {
          const ownerEmail = process.env.EMAIL_ID
          const owner = await User.findOne({ email: ownerEmail })
          const message = {
            notification: {
              title: "New Booking",
              body: notification
            },
            token: owner.fcmToken
          }
          //console.log("Owner FCM Token:", owner.fcmToken)
          if (owner.fcmToken) {
            const response = await admin.messaging().send(message)
            console.log(response)
          }
        }
      }
      catch (error) {
        console.log(error.message)
      }
    }
    )

    socket.on("cancel-booking", async (bookingInfo) => {
      const { bookingId } = bookingInfo
      const { role } = socket.user

      try {
        const booking = await Bookings.findById(bookingId)

        if (!booking)
          return res.status(404).json("No such booking found")

        const carId = booking.carId
        const userEmail = booking.userEmail
        booking.bookingStatus = "Cancelled"
        await Bookings.save()

        const car = await Bookings.findById(carId)
        car.availability = "Available"
        await car.save()

        socket.emit("bookingCancelled", { message: "Booking Cancelled" })//to sender

        //send to verified-user
        if (role === "owner") {
          const socketId = userSocketId.get(userEmail)
          if (socketId) {
            io.to(socketId).emit("bookingCancelled", { message: "Booking Cancelled" })
          }
          else {
            const person = await User.findOne({ email: userEmail })
            const message = {
              notification: {
                title: "Booking Cancelled",
                body: ""
              },
              token: person.fcmToken
            }
            //console.log("Owner FCM Token:", owner.fcmToken)
            if (person.fcmToken) {
              const response = await admin.messaging().send(message)
              console.log(response)
            }
          }
        }
        else if (role === "verified-user")//send to owner
        {
          if (ownerSocketId)
            io.to(ownerSocketId).emit("bookingCancelled", { message: "Booking Cancelled" })
          else {
            const person = await User.findOne({ email: process.env.EMAIL_ID })
            const message = {
              notification: {
                title: "Booking Cancelled",
                body: ""
              },
              token: person.fcmToken
            }
            //console.log("Owner FCM Token:", owner.fcmToken)
            if (person.fcmToken) {
              const response = await admin.messaging().send(message)
              console.log(response)
            }
          }
        }
      }
      catch (error) {
        console.log(error.message)
        return res.status(500).json(error.message)
      }

    })
  }
  )
}

export default CarBookings