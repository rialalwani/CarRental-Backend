import cron from "node-cron"
import Bookings from "./Models/Bookings.js"
import CarImages from "./Models/image.js"

const scheduler = async () => {
    cron.schedule('0 * * * *', async () => {
        const now = new Date();
        const expiredBookings = await Bookings.find({ bookingEndDate: { $lt: now },bookingStatus:"Booked"});
        const automaticCancelledBookings=await Bookings.find({bookingEndDate:{$lt:now},bookingStatus:{$in:["Pending","Accepted"]}})

        //console.log(expiredBookings)
        for (let booking of expiredBookings) {
            await CarImages.findByIdAndUpdate(booking.carId, { availability: "Available" ,nextAvailibility:null});
            booking.bookingStatus = 'Completed';
            await booking.save();
        }

        for (let booking of automaticCancelledBookings)
        {
            //console.log(new Date(booking.bookingEndDate).toLocaleString())
            booking.bookingStatus="Cancelled"
            await booking.save();
        }
    });
}

export default scheduler


