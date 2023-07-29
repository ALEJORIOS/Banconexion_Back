"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
app.get("/hola", (req, res) => {
    res.send("Perfect");
});
app.listen(process.env.PORT, () => {
    console.log('Listening on port ', process.env.PORT);
});
