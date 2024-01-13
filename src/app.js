import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"})); // accepting JSON

app.use(express.urlencoded({extended: true, limit: "16kb"})); // this is for encoding URL data
app.use(express.static("public "));

export {app}