import nodemailer from "nodemailer"
import dotenv from "dotenv"
import User from "../Models/user.js"
import {google} from "googleapis" 
import CarImages from "../Models/image.js"
import path from "path"

dotenv.config()

const oAuth2=google.auth.OAuth2
const oAuth2Client=new oAuth2(
   process.env.CLIENT_ID,
   process.env.CLIENT_SECRET,
   "https://developers.google.com/oauthplayground"
)

oAuth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN})
const accessToken=(await oAuth2Client.getAccessToken()).token

const transporter=nodemailer.createTransport({
   service:"gmail",
   auth:{
      type:"OAuth2",
      user:process.env.EMAIL_ID,
      clientId:process.env.CLIENT_ID,
      clientSecret:process.env.CLIENT_SECRET,
      refreshToken:process.env.REFRESH_TOKEN,
      accessToken:accessToken
   }
})


export const sendEmail=async(req,res)=>{
    try {

    // 3. Fetch car details (if needed)
    const bookingDetails=JSON.parse(req.body.bookingDetails)
    const aadhaar=req.body.aadhaar
    const dl=req.body.dl
    const car = await CarImages.findById(bookingDetails.carId);
    console.log(bookingDetails.userEmail)
    const user=await User.findOne({email:bookingDetails.userEmail})

    // 4. Compose the email to owner
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: process.env.EMAIL_ID, // sending TO owner
      subject: `New Booking from ${user.name}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phoneNumber}</p>
        <p><strong>Car:</strong> ${car?.carname || "N/A"}</p>
        <p><strong>Booking Dates:</strong> ${new Date(bookingDetails.bookingStartDate).toDateString()} to ${new Date(bookingDetails.bookingEndDate).toDateString()}</p>
        <p><strong>Booking Charges:</strong> ${bookingDetails.bookingCharges}</p>
        <p><strong>Pick Up and Drop:</strong> ${bookingDetails.pickUpDrop ? bookingDetails.location : "No"}</p
        <p><strong>Attached Documents:</strong> Aadhaar + DL</p>
      `,
      attachments: [
        {
          filename: `aadhaar${path.extname(aadhaar)}`,
          path: aadhaar, // e.g. './uploads/aadhaar123.pdf'
        },
        {
          filename: `dl${path.extname(dl)}`,
          path: dl, // e.g. './uploads/dl123.pdf'
        }
      ]
    };

    // 5. Send the email
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to owner with Aadhaar & DL");
    return res.status(200).json("Email sent")

    // 6. (Optional) Notify user/owner via socket or Firebase here

  } catch (err) {
    console.error("Failed to send booking email:", err.message);
     return res.status(404).json("Something went wrong...")
  }
};