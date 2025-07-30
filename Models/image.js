import mongoose from "mongoose";

const carImages=new mongoose.Schema({
    url:{type:"String",required:"true"},
    public_id:{type:"String",required:"true"},
    carname:{type:"String",required:"true"},
    cardesc:{type:"String",required:"true"},
    filename:{type:"String",required:"true"},
    filetype:{type:"String",required:"true"},
    filepath:{type:"String",required:"true"},
    filesize:{type:"String",required:"true"},
    price:{type:"Number"},
    availability:{type:"String",enum:["Available","Booked","Not Available"],default:"Available"},
    nextAvailibility:{type:Date,default:null},
    uploadedAt: {
        type: Date,
        default: Date.now
      }
})

export default mongoose.model("CarImages",carImages)