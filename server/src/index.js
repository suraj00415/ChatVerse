import dotenv from "dotenv";
import app from "./app.js";
import { port } from "./utils/constants.js";

dotenv.config({
    path: "../.env",
});

app.listen(port, () => {
    console.log("🙌😀 Server started on port:", port);
});
