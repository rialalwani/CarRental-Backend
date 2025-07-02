import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()
export const verifytoken=(req,res,next)=>{
    const auth_headers=req.headers.authorization
    //console.log(auth_headers)

    if(!auth_headers || !auth_headers.startsWith("Bearer"))
        return res.status(401).json("Unauthorized")

    const token=auth_headers.split(" ")[1]
    //console.log(token)

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        //console.log(decoded)
        next()
    }
    catch(error)
    {
      console.log(error.message)
       return res.status(403).json({ error: "Invalid token" });
    }
}