import multer from "multer"

const storage= multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
})

const fileFilter=(req,file,cb)=>{
    //console.log(file?.mimetype)
    const allowedTypes=["application/pdf","image/png","image/jpeg","image/jpg"]
    if(allowedTypes.includes(file.mimetype))
        cb(null,true)
    else
        cb(null,false)
}

export const upload = multer({ storage ,fileFilter,}).fields([
  { name: "aadhaar", maxCount: 1 },
  { name: "dl", maxCount: 1 },
])

