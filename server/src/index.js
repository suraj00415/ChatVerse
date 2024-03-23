import dotenv from "dotenv";
import app from "./app.js";
import { port } from "./utils/constants.js";
import connectDB from "./utils/connectDb.js";

dotenv.config({
    path: "../.env",
});

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log("🙌😀 Server started on port:", port);
        });
    })
    .catch((err) => {
        console.log(
            "Some errror Occured while connecting to the database:",
            err
        );
    });


import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes);