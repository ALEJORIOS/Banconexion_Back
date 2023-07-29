import { configDotenv } from "dotenv";
import express, { Express, Request, Response } from "express";
import DBConnection from "./db";
import { FieldInfo, MysqlError } from "mysql";

configDotenv();

const app: Express = express();

// Start Connection to DB

const dBConnection = new DBConnection("localhost", "banconexion", "root", "");



app.get("/hola", (req: Request, res: Response) => {
    const result: any = [];
    dBConnection.connection.query('SELECT * FROM personas', (error: MysqlError | null, results?: any, fields?: FieldInfo[]) => {
        if(error) {
            throw error;
        }

        results.forEach((res: FieldInfo) => {
            result.push(JSON.parse(JSON.stringify(res)))
            console.log('>> ', res);
        });
        res.send(result);
    })
})

app.listen(process.env.PORT, () => {
    console.log('Listening on port ', process.env.PORT);
})