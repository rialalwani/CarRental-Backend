import multer from "multer"

const fileFilter=(req,file,cb)=>{
    const allowedTypes=["image/jpg","image/jpeg","image/png","image/webp"]
    if(allowedTypes.includes(file.mimetype))
        cb(null,true)
    else
       cb(new Error("Only image(jpg,jpeg,png,webp) files are allowed",false))
}

export const upload = multer(
    {
        dest: "uploads",
        fileFilter:fileFilter,
        limits:{fileSize:2*1024*1024} //2mb
    }
    
)