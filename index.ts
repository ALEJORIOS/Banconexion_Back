import { configDotenv } from "dotenv";
import express, { Express, Request, Response } from "express";
import DBConnection from "./db";
import { FieldInfo, MysqlError } from "mysql";

configDotenv();

const app: Express = express();

app.use(express.json())

// Start Connection to DB

app.listen(process.env.PORT, () => {
    console.log('Listening on port ', process.env.PORT);
})

const dBConnection = new DBConnection("localhost", "banconexion", "root", "kp9ytz4Rmdz5");

function reportFailure(error: string): Promise<number> {
    return new Promise((res) => {
        const ErrorJson: any = JSON.parse(error);
        dBConnection.connection.query(`INSERT INTO failures(DATE, CODE, ERRNO, ERROR) VALUES(NOW(), '${ErrorJson.code}', '${ErrorJson.errno}','${ErrorJson.sql}')`, (error: MysqlError | null, results?: any, fields?: FieldInfo[]) => {
            res(results.insertId)
        })
    })
}

function endConnection() {
    dBConnection.endConnection();
}

app.post("/register", (req: Request, res: Response) => {
    const query: string = `INSERT INTO persons(NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT, ADMIN) VALUES ("${req.body.name}", "${req.body.type}", "${req.body.document}", ${req.body.age}, ${req.body.transport}, 0)`;
    dBConnection.connection.query(query, async(error: MysqlError | null, results?: any, fields?: FieldInfo[]) => {
        if(error) {
            const errorId = await reportFailure(JSON.stringify(error));
            res.statusCode = 409;
            res.send("Ocurrió un error al intentar crear este registro. ID del error: "+errorId);
            console.error(error);
        }else{
            res.statusCode = 200;
            res.send("OK");
        }

    });
})

app.get("/hola", (req: Request, res: Response) => {
    const result: any = [];
    dBConnection.connection.query('SELECT * FROM persons', (error: MysqlError | null, results?: any, fields?: FieldInfo[]) => {
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
