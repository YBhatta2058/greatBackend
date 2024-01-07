import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,'./public/temp')
    },
    filename: function (req,file,cb){
        cb(null,file.originalname) // change the name of the file here to something unique. 
        // We are just keeping the files for very less time on our server before uploading into cloudinary
        // also 
    }
})

const upload = multer({ storage })
export { upload }