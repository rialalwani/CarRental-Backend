import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const SocketAuth=(socket,next)=>{
    const {token,fcmToken}=socket.handshake.auth
    //console.log(fcmToken)
    
    if(!token)
    {
        console.log("No token")
        return (next(new Error("No token")))
    }

    try{
        const user=jwt.verify(token,process.env.JWT_SECRET)
        socket.user=user
        //console.log("user verified")
        socket.fcmToken=fcmToken
        //console.log("token verified",fcmToken)
        next()
    }
    catch(error)
    {
        console.log(error.message)
        return (next(new Error("Authentication failed")))
    }
}

export default SocketAuth