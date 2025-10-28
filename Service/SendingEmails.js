import nodemailer from "nodemailer"
import dotenv from "dotenv"
import User from "../Models/user.js"
import {google} from "googleapis" 
import CarImages from "../Models/image.js"
import fs from "fs"

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
     console.log("send-email called")
    // 3. Fetch car details (if needed)
    const bookingDetails=JSON.parse(req.body.bookingDetails)
    const aadhaar=req.files?.aadhaar?.[0]
    const dl=req.files?.dl?.[0]
    const car = await CarImages.findById(bookingDetails.carId);
    console.log(bookingDetails.userEmail)
    const user=await User.findOne({email:bookingDetails.userEmail})

     const attachments = [];
    if (req.files.aadhaar) {
      attachments.push({
        filename: req.files.aadhaar[0].originalname,
        content: req.files.aadhaar[0].buffer,
        contentType: req.files.aadhaar[0].mimetype,
      });
    }
    if (req.files.dl) {
      attachments.push({
        filename: req.files.dl[0].originalname,
        content: req.files.dl[0].buffer,
        contentType: req.files.dl[0].mimetype,
      });
    }


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
      attachments
    };

    // 5. Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent to owner with Aadhaar & DL");

    return res.status(200).json("Email sent")

    // 6. (Optional) Notify user/owner via socket or Firebase here



  } catch (err) {
    console.error("Failed to send booking email:", err.message);
     return res.status(404).json("Something went wrong...")
  }
};