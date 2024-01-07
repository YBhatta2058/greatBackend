import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:'16kb'})) // only upto 16 kb of json data is accepted
app.use(express.urlencoded({extended: true})) //extended means when data is coming from url, extended objects are allowed
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'


//routes declaration
app.use("/api/v1/users",userRouter)


export { app }