import mongoose from "mongoose";

const Bookings=new mongoose.Schema({
    userEmail:{type:String,required:true},
    carId:{type:String,required:true},
    bookingDone:{type:Date,default:Date.now},
    bookingStartDate:{type:Date},
    bookingEndDate:{type:Date},
    bookingCharges:{type:Number},
    bookingStatus:{type:String,enum:["Pending","Accepted","Booked","Cancelled","Completed"]},
    pickUpDrop:{type:Boolean,default:false},
    location:{type:String,default:null}
})

export default mongoose.model("Bookings",Bookings)