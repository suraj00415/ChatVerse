import dotenv from "dotenv";
import app from "./app.js";
import { httpServer } from "./app.js";
import { port } from "./utils/constants.js";
import connectDB from "./utils/connectDb.js";

dotenv.config({
    path: "../.env",
});

connectDB()
    .then(() => {
        httpServer.listen(port, () => {
            console.log("🙌😀 Server started on port:", port);
        });
    })
    .catch((err) => {
        console.log(
            "Some errror Occured while connecting to the database:",
            err
        );
    });


