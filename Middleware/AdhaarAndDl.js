import multer from "multer"

const storage= multer.memoryStorage()

const fileFilter=(req,file,cb)=>{
    const allowedTypes=["application/pdf","image/png","image/jpeg","image/jpg"]
    if(allowedTypes.includes(file.mimetype))
        cb(null,true)
    else
        cb(null,false)
}