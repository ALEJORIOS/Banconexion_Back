"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Start Connection to DB
const dBConnection = new db_1.default("localhost", "banconexion", "root", "");
app.post("/register", (req, res) => {
    const query = `INSERT INTO personas(FULL_NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT) VALUES (${req.body.name, req.body.type, req.body.document, req.body.age, req.body.transport})`;
    dBConnection.connection.query(query);
});
app.get("/hola", (req, res) => {
    const result = [];
    dBConnection.connection.query('SELECT * FROM personas', (error, results, fields) => {
        if (error) {
            throw error;
        }
        results.forEach((res) => {
            result.push(JSON.parse(JSON.stringify(res)));
            console.log('>> ', res);
        });
        res.send(result);
    });
});
app.listen(process.env.PORT, () => {
    console.log('Listening on port ', process.env.PORT);
});
