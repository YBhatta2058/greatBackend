// require('dotenv').config({path:'./env'})
import connectDB from "./db/index.js";
import dotenv from "dotenv"


dotenv.config({
    path:'./env'
})

connectDB()







/*YESARI NI GARNA MILCHA

import express from "express"

const app = express()

( async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",()=>{
            console.log("ERRR: ",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log("APP is listening to port ", process.env.PORT)
        })
    }catch(error){
        console.log("ERROR: ",error)
    }
} )()
*/

