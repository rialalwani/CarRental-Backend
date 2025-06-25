import {mongoose} from "mongoose"

const UserSchema=new mongoose.Schema({
    email:{type:"String",required:"true",unique:"true"},
    phoneNumber:{type:"String"},
    name:{type:"String"},
    password:{type:"String"},
    userType:{type:"String"},
    fcmToken:{type:"String"}
})

export default mongoose.model("User",UserSchema)