import { configDotenv } from "dotenv";
import express from "express";

configDotenv();

const app = express();

app.get("/hola", (req, res) => {
    res.send("Perfect");
})

app.listen(process.env.PORT, () => {
    console.log('Listening on port ', process.env.PORT);
})