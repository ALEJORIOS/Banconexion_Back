import { configDotenv } from "dotenv";
import express, { Express, Request, Response } from "express";
import DBConnection from "./db";
import { FieldInfo, MysqlError } from "mysql";

configDotenv();

const app: Express = express();

app.use(express.json())

// Start Connection to DB

const dBConnection = new DBConnection("localhost", "banconexion", "root", "");

app.post("/register", (req: Request, res: Response) => {
    const query: string = `INSERT INTO personas(FULL_NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT) VALUES (${req.body.name, req.body.type, req.body.document, req.body.age, req.body.transport})`;
    dBConnection.connection.query(query);
})

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