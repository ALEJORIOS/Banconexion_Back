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
app.listen(process.env.PORT, () => {
    console.log('Listening on port ', process.env.PORT);
});
const dBConnection = new db_1.default("localhost", "banconexion", "root", "kp9ytz4Rmdz5");
function reportFailure(error) {
    return new Promise((res) => {
        const ErrorJson = JSON.parse(error);
        dBConnection.connection.query(`INSERT INTO failures(DATE, CODE, ERRNO, ERROR) VALUES(NOW(), '${ErrorJson.code}', '${ErrorJson.errno}','${ErrorJson.sql}')`, (error, results, fields) => {
            res(results.insertId);
        });
    });
}
function endConnection() {
    dBConnection.endConnection();
}
app.post("/register", (req, res) => {
    const query = `INSERT INTO persons(NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT, ADMIN) VALUES ("${req.body.name}", "${req.body.type}", "${req.body.document}", ${req.body.age}, ${req.body.transport}, 0)`;
    dBConnection.connection.query(query, async (error, results, fields) => {
        if (error) {
            const errorId = await reportFailure(JSON.stringify(error));
            res.statusCode = 409;
            res.send("Ocurrió un error al intentar crear este registro. ID del error: " + errorId);
            console.error(error);
        }
        else {
            res.statusCode = 200;
            res.send("OK");
        }
    });
});
app.put("/edit-user", (req, res) => {
    const query = `UPDATE persons SET NAME="${req.body.name}", DOCUMENT_TYPE="${req.body.type}", DOCUMENT="${req.body.document}", AGE=${req.body.age}, TRANSPORT=${req.body.transport} WHERE ID=${req.query.id}`;
    dBConnection.connection.query(query, async (error, results, fields) => {
        if (error) {
            const errorId = await reportFailure(JSON.stringify(error));
            res.statusCode = 409;
            res.send("Ocurrió un error al intentar actualizar este registro. ID del error: " + errorId);
            console.error(error);
        }
        else {
            res.statusCode = 200;
            res.send("OK");
        }
    });
});
