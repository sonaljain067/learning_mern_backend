import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express() 

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true 
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true, 
    limit: true 
}))

app.use(express.static("public")) 

app.use(cookieParser()) 

// router import
import userRouter from "./routes/user.route.js"
import addressRouter from "./routes/address.route.js"
import categoryRouter from "./routes/category.route.js"
import artisanRouter from "./routes/artisan.route.js"

// router declaration 
app.use("/api/v1/users", userRouter)

app.use("/api/v1/address", addressRouter)

app.use("/api/v1/category", categoryRouter)

app.use("/api/v1/artisan", artisanRouter)

export { app }