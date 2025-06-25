import User from "../Models/user.js"
import {google} from "googleapis"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

dotenv.config()
const oAuth2=google.auth.OAuth2
const oAuth2Client=new oAuth2(
   process.env.CLIENT_ID,
   process.env.CLIENT_SECRET,
   process.env.REDIRECT_URI
)

oAuth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN})
const accessToken=(await oAuth2Client.getAccessToken()).token
const otpStore=new Map();

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
   if(user)
      return res.status(404).json("user already exists")

   const otp=(Math.floor(Math.random()*9000)+1000).toString();
   console.log(otp)
   const otpExpiry=Date.now()+120000//otp valid for 2 mins
   otpStore.set(email,{otp:otp,otpExpiry:otpExpiry})
   try{

      const info=await transporter.sendMail({
         from:process.env.EMAIL_ID,
         to:email,
         subject:"Verify your email-AMR Wheels Car Rental Service", 
         html:`<p>Hello,</p>
              <p>Thank you for visiting our site.</p>
              <p>Here is your One Time Password:<strong>${otp}</strong></p>
              <p>This will expire in 2 minutes.</p>
              <p>Best Regards,<br><strong>Aryan Mishra</strong><p>`
      })
      return res.status(200).json("Otp Sent Successfully")
   }
   catch(error)
   {
      console.log(error.message)
      return res.status(404).json(error.message)
   }
}

export const verifyotp=async(req,res)=>{
     const {email,Otp,password,name,number}=req.body
     const saltRounds=10
     console.log(email,Otp)
     if(Otp===otpStore.get(email)?.otp && Date.now()<otpStore.get(email)?.otpExpiry)
     {
       try{
         const hashedPassword=await bcrypt.hash(password,saltRounds)
         const user=new User({email:email,password:hashedPassword,name:name,phoneNumber:number})
         if (email==process.env.EMAIL_ID)
         {
            user.userType="owner"
         }
         else
         user.userType="verified-user"
         await user.save()

         const user_data=await User.findOne({email})
         const data={email:user_data.email,name:user_data.name}
         const token=jwt.sign({id:user_data._id,email:email,userType:user.userType},process.env.JWT_SECRET,{expiresIn:"1h"})
         return res.status(200).json({user:data,token:token})
       }
       catch(error)
       {
         console.log(error.message)
         return res.status(404).json(error.message)
       }
     }
     else{
      return res.status(404).json("Invalid otp")
     }
}

export const login=async(req,res)=>{
   try{
   //console.log(req.body)
    const {email,password}=req.body
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if(!regex.test(email))//invalid email
    return res.status(404).json("Inavlid Email")

      const user=await User.findOne({email})
      //console.log(user)
      if(!user)
         return res.status(400).json("User does not exist")

      if(await bcrypt.compare(password,user.password) || password===user.password)
      {
         if(email===process.env.EMAIL_ID)
            user.userType="owner"
         else
           user.userType="verified-user"
         const token=jwt.sign({id:user._id,email:user.email,userType:user.userType},process.env.JWT_SECRET,{expiresIn:"1h"})
         const data={email:user.email,name:user.name}
         return res.status(200).json({user:data,token:token})
      }
      else
        return res.status(401).json("Invalid password")
    }
    catch(error)
    {
      console.log(error.message)
      return res.status(404).json(error.message)
    }
}

