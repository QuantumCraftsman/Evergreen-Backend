import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";



const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("Public"))
app.use(cookieParser())
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
  })

import userRouter from './routes/user.routes.js'

console.log("route is loaded")
app.use("/api/v1/users",userRouter)


export {app} 