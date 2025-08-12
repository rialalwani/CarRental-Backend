import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../Models/Payment.js';
import Bookings from '../Models/Bookings.js';
import Image from '../Models/image.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
})

export const createOrder = async (req, res) => {
    const { amount} = req.body; //amount in rupees
    //console.log("Creating order with amount:", amount);
    try {
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${new Date().getTime()}`,
        };

        const order = await razorpay.orders.create(options);
        //console.log("Order created:", order);
        res.status(200).json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
}

export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount,bookingId } = req.body;
    console.log("Verifying payment with order ID:", razorpay_order_id, "and payment ID:", razorpay_payment_id);

   const body=`${razorpay_order_id}|${razorpay_payment_id}`;

   const expectedSignature=crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
   .update(body.toString())
   .digest('hex')


   if(expectedSignature===razorpay_signature){
       //Payment is successful
         const payment = new Payment({
              user:req.user.email,
              order_id: razorpay_order_id,
              payment_id: razorpay_payment_id,
              signature: razorpay_signature,
              amount: amount,
              status: 'success'
         });
        await payment.save();

        const booking = await Bookings.findById(bookingId);
        booking.bookingStatus="Booked"
        await booking.save();
        
        const carId=booking.carId
        const car = await Image.findById(carId)
        car.availability="Not Available"
        car.nextAvailibility=booking.bookingEndDate
        await car.save();


       res.status(200).json({success:true})
   }
   else
   {
    res.status(400).json({success:false, message:"Payment verification failed"})
   }
}

export const getPaymentDetails = async (req, res) => {
    const {email}=req.user
    try{
        const payments = await Payment.find({ 'user': email });
        if (payments.length === 0) {
            return res.status(404).json({ message: 'No payment details found' });
        }
        res.status(200).json(payments);
    }
    catch(error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ error: 'Failed to fetch payment details' });
    }
}

export const getAllPayments=async(req,res)=>{
    const {email,userType}=req.user
    if(email===process.env.EMAIL_ID && userType==="owner")
    {
        try{
            const payments = await Payment.find();
            if (payments.length === 0) {
                return res.status(404).json({ message: 'No payment details found' });
            }
            res.status(200).json(payments);
        }
        catch(error) {
            console.error('Error fetching payment details:', error);
            res.status(500).json({ error: 'Failed to fetch payment details' });
        }
    }
}