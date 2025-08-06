import Bookings from "../Models/Bookings.js"
import CarImages from "../Models/image.js"
import admin from "firebase-admin"
import User from "../Models/user.js"
import dotenv from "dotenv"
import mongoose from "mongoose"
import Cancelledbookings from "../Models/Cancelledbookings.js"
import { readFileSync } from 'fs';
//import serviceAccount from "../../../../../Downloads/car-rental-68d5f-firebase-adminsdk-fbsvc-331f56efb0.json" assert { type: 'json' };

dotenv.config()

const serviceAccount = JSON.parse(
  readFileSync('/etc/secrets/car-rental-68d5f-firebase-adminsdk-fbsvc-331f56efb0.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

let ownerSocketId = null
const userSocketId = new Map()

const CarBookings = (io) => {

  io.on("connection", async (socket) => {

    console.log("user connected", socket.id)
    const { email, userType } = socket.user
    //console.log("userType", userType)
    const { fcmToken } = socket
    if (userType == "owner") {
      ownerSocketId = socket.id
    }
    else if (userType == "verified-user")
      userSocketId.set(email, socket.id)

    const user = await User.findOne({ email })
    user.fcmToken = fcmToken
    await user.save();
    //console.log("FCM Token saved:", user.fcmToken)
    //console.log("Owner Socket ID:", ownerSocketId)


    socket.on("booking-req", async (bookingDetails) => {
      try {

        const { carId } = bookingDetails

        const booking = new Bookings({
          userEmail: bookingDetails.userEmail,
          carId: carId,
          bookingStartDate: bookingDetails.bookingStartDate,
          bookingEndDate: bookingDetails.bookingEndDate,
          bookingCharges: bookingDetails.bookingCharges,
          bookingStatus: bookingDetails.bookingStatus,
          pickUpDrop:bookingDetails.pickUpDrop,
          location:bookingDetails.location
        })
        await booking.save();
        console.log("booking received")
        const car = await CarImages.findById(carId)


        socket.emit("bookingPending", { message: "Booking pending" })
        //console.log(ownerSocketId)


        const notification = `Booking for ${car.carname} from ${bookingDetails.bookingStartDate} to ${bookingDetails.bookingEndDate}\nTap to see the details`


        if (ownerSocketId) {
          io.to(ownerSocketId).emit("NewRequest", { message: notification })
          console.log("sent", ownerSocketId)
        }
        else {
          const ownerEmail = process.env.EMAIL_ID
          const owner = await User.findOne({ email: ownerEmail })
          const message = {
            notification: {
              title: "New Booking Request",
              body: notification
            },
            token: owner.fcmToken
          }
          //console.log("Owner FCM Token:", owner.fcmToken)
          if (owner.fcmToken) {
            const response = await admin.messaging().send(message)
            console.log("res", response)
          }
        }

      }
      catch (error) {
        console.log(error.message)
      }
    }
    )




    socket.on("booking-accept", async ({ bookingId }) => {
      try {
        const ownerEmail = socket.user.email
        if (ownerEmail !== process.env.EMAIL_ID) {
          socket.emit("error", {message:"Only owners can accepy car requests"});
          return;
        }

        const booking = await Bookings.findById(bookingId);
        booking.bookingStatus = "Accepted"
        await booking.save();
        socket.emit("booking-accept", { message: "Booking Accepted" })
        const { userEmail } = booking;
        console.log(booking)
        console.log(userEmail)
        const socketId = userSocketId.get(userEmail)
        if (socketId)
          io.to(socketId).emit("BookingAccepted", { message: "Booking Accepted" })
        else {
          const customer = await User.findOne({ email: userEmail });
          if (customer.fcmToken) {
            const res = await admin.messaging().send({
              notification: {
                title: "Booking Accepted",
                body: "Booking Accepted. Please complete the payment to confirm your booking."
              },
              token: customer.fcmToken
            })
            console.log(res)
          }
        }
      }
      catch (error) {
        console.log(error.message)
        socket.emit("error", {message:"Something went wrong..."});
          return;
      }
    })








    /*socket.on("paymentDone", async ({ bookingId }) => {
      try {
        console.log(bookingId)
        const id = new mongoose.Types.ObjectId(bookingId)
        const bookingDetails = await Bookings.findById(id)
        bookingDetails.bookingStatus = "Booked"
        await bookingDetails.save();
        const { carId } = bookingDetails
        const car = await CarImages.findById(carId)
        car.availability = "Not Available"
        car.nextAvailibility = bookingDetails.bookingEndDate
        await car.save();

        socket.emit("BookingDone", { message: "Booking done" })
        //console.log(ownerSocketId)

        const notification = `Booking for ${car.carname} from ${bookingDetails.bookingStartDate} to ${bookingDetails.bookingEndDate} is completed.\nTap to see the details`


        if (ownerSocketId) {
          io.to(ownerSocketId).emit("NewBooking", { message: notification })
          console.log("sent", ownerSocketId)
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
    })*/

    socket.on("booking-completed",async({bookingId})=>{
      const id = new mongoose.Types.ObjectId(bookingId)
      const bookingDetails = await Bookings.findById(id)
      const { carId } = bookingDetails
      const car=await CarImages.findById(carId)
      
      const notification = `Booking for ${car.carname} from ${bookingDetails.bookingStartDate} to ${bookingDetails.bookingEndDate} is completed.\nTap to see the details`


        if (ownerSocketId) {
          io.to(ownerSocketId).emit("NewBooking", { message: notification })
          console.log("sent", ownerSocketId)
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
  })






    socket.on("cancel-booking", async (bookingInfo) => {

      const { bookingId } = bookingInfo
      const role= socket.user.userType

      try {

        const booking = await Bookings.findById(bookingId)

        if (!booking) {
          socket.emit("error", { message: "No such booking found" });
          return;
        }

        if (role === "verified-user" && socket.user.email !== booking.userEmail) {
          socket.emit("error", { message: "Unauthorized attempt" });
          return;
        }

        if (role === "owner" && socket.user.email !== process.env.EMAIL_ID) {
          socket.emit("error", { message: "Unauthorized attempt" });
          return;
        }

        if(booking.bookingStatus==="Completed" || booking.bookingStatus==="Cancelled")
        {
          socket.emit("error", { message: "Invalid Request" });
          return;
        }


        const car = await CarImages.findById(booking.carId)


        let receiverSocketId = null
        let receiverFcmToken = null
        if (role === "verified-user") {
          receiverSocketId = ownerSocketId
          const receiverData = await User.findOne({ email: process.env.EMAIL_ID })
          receiverFcmToken = receiverData.fcmToken
        }
        else if (role === "owner") {
          receiverSocketId = userSocketId.get(booking.userEmail)
          const receiverData = await User.findOne({ email: booking.userEmail })
          receiverFcmToken = receiverData.fcmToken
        }
        console.log(receiverSocketId)
        console.log(receiverFcmToken)

        const status = booking.bookingStatus
        const notification = `Booking for ${car.carname} from ${booking.bookingStartDate} to ${booking.bookingEndDate} is cancelled.\nTap to see the details`
        const message = {
          notification: {
            title:"Booking Cancelled",
            body:notification
          },
          token: receiverFcmToken
        }

        if(status==="Accepted"|| status==="Pending" || role==="verified-user")
        {
           const cancelledBooking=new Cancelledbookings({
            userEmail:booking.userEmail,
            bookingId:bookingId,
            Refund:false,
            RefundStatus:"Not Applicable"
           })
           await cancelledBooking.save()
        }
        else if(status==="Booked" && role==="owner")
        {
          const cancelledBooking=new Cancelledbookings({
            userEmail:booking.userEmail,
            bookingId:bookingId,
            Refund:true,
            RefundStatus:"Pending"
           })
           await cancelledBooking.save()
        }
       
        booking.bookingStatus = "Cancelled"
        await booking.save();
        car.availability = "Available"
        car.nextAvailibility = null
        await car.save();

        socket.emit("BookingCancelled",{message:"Booking Cancelled"})
        if(receiverSocketId)
          io.to(receiverSocketId).emit("Booking-Cancelled",{message:"Booking has been cancelled"})
        else
        {
          await admin.messaging().send(message)
        }

      }
      catch (error) {
        console.log(error.message)
        socket.emit("error",{message:"Something went wrong..."})
        return;
      }
    }
    )
  })
}

export default CarBookings