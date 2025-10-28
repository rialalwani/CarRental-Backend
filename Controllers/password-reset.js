import User from "../Models/user.js"
import {google} from "googleapis"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import dotenv from "dotenv"

dotenv.config()
const oAuth2=google.auth.OAuth2
const oAuth2Client=new oAuth2(
   process.env.CLIENT_ID,
   process.env.CLIENT_SECRET,
   process.env.REDIRECT_URI
)

oAuth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN})
const accessToken=(await oAuth2Client.getAccessToken()).token
let otp=""
let otpExpiry=null

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

export const sendotp=async(req,res)=>{
   const {email}=req.body
   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   if(!regex.test(email))//invalid email
   return res.status(404).json("Inavlid Email")

   const user=await User.findOne({email})
   if(!user)
      return res.status(404).json("User does not exist")

   otp=(Math.floor(Math.random()*9000)+1000).toString();
   console.log(otp)
   otpExpiry=Date.now()+120000//otp valid for 2 mins
   try{

      const info=await transporter.sendMail({
         from:process.env.EMAIL_ID,
         to:email,
         subject:"Password Reset-AMR Wheels Car Rental Service", 
         html:`<p>Hello,</p>
              <p>Thank you for visiting our site.</p>
              <p>Here is your One Time Password for password-reset:<strong>${otp}</strong></p>
              <p>This will expire in 2 minutes.</p>
              <p>Best Regards,<br><strong>Aryan Mishra</strong><p>`
      })
      return res.status(200).json("Otp Sent Successfully")
   }
   catch(error)
   {
      console.log(error.message)
   }
}

export const verifyotp=async(req,res)=>{
     const {email,Otp}=req.body
     console.log(email,Otp)
     if(Otp===otp)
     {
       try{
         return res.status(200).json("Email Verified")
       }
       catch(error)
       {
         console.log(error.message)
       }
     }
     else{
      return res.status(404).json("Invalid otp")
     }
}

export const resetPassword=async(req,res)=>{
    const {email,newPassword}=req.body
    const saltRounds=10;
    const hashedPassword=await bcrypt.hash(newPassword,saltRounds)

    try{
        const user=await User.findOne({email})
        if(!user)
            return res.status(404).json("User does not exist")

        user.password=hashedPassword
        await user.save()
        return res.status(200).json("Password reset successfull")
    }
    catch(error) 
    {
        console.log(error)
    }
}