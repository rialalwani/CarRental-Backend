import Bookings from "../Models/Bookings.js";

export const getMyBookings = async (req, res) => {
    const { email } = req.user
    try {
        const bookings = await Bookings.find({ userEmail: email })
        return res.status(200).json(bookings)
    }
    catch (error) {
        console.log(error.message)
        return res.status(404).json(error.message)
    }
}

export const getAllBookings = async (req, res) => {
    const {email} = req.user
    try {
        if (email === process.env.EMAIL_ID) {
            const bookings = await Bookings.find()
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