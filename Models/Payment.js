import mongoose from 'mongoose';

const paymentSchema=new mongoose.Schema({
    user: {
    type:String,
    required: true
  },
   order_id:String,
   payment_id:String,
   signature:String,
   amount:Number,
   status:String,
   createdAt:{
       type:Date,
       default:Date.now
   }
})

export default mongoose.model("Payment",paymentSchema);