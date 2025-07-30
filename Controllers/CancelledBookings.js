import Cancelledbookings from "../Models/Cancelledbookings.js"

export const getMyCancelledBookings = async (req, res) => {
    const { email } = req.user
    try {
        const cancelledBookings=await Cancelledbookings.find({userEmail:email})
        return res.status(200).json(cancelledBookings)
    }
    catch (error) {
        console.log(error.message)
        return res.status(404).json(error.message)
    }
}

export const getAllCancelledBookings = async (req, res) => {
    const {email} = req.user
    try {
        if (email === process.env.EMAIL_ID) {
            const bookings = await Cancelledbookings.find()
            return res.status(200).json(bookings)
        }
        else
            return res.status(401).json("Unauthorized user")
    }
     catch (error) {
        console.log(error.message)
        return res.status(404).json(error.message)
    }
}