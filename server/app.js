import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express();
const corsOptions={
    origin:process.env.CORS_ORIGIN,
}


app.use(cors(corsOptions))
app.use(cookieParser())
app.use(urlencoded())
app.use()