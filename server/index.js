import express from "express";
import app from "../server/app"


const port =process.env.PORT || 8081



app.listen(port,()=>{
    console.log("Server started on port:",port)
})