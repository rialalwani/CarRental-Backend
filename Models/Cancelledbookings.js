import mongoose from "mongoose"

const CancelledBookings=new mongoose.Schema({
    userEmail:{type:String,required:true},
    bookingId:{type:String,required:true},
    Refund:{type:Boolean},
    RefundStatus:{type:String,enum:["Not Applicable","Pending","Completed"],default:"Not Applicable"}
})

export default mongoose.model("CancelledBookings",CancelledBookings)