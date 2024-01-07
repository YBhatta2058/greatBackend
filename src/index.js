// require('dotenv').config({path:'./env'})
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { app } from "./app.js";


dotenv.config({
    path:'./env'
})


connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR: ",err)
        throw error
    })
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MONGO DB CONNECTION FAILED !!", error)
})

























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

