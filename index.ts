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

/**
 * Register a new user 
 * The admin value is 0 by default
 */
app.post("/register", async(req: Request, res: Response) => {
    const query: string = `INSERT INTO persons(NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT, ADMIN) VALUES ("${req.body.name}", "${req.body.type}", "${req.body.document}", ${req.body.age}, ${req.body.transport}, 0)`;
    await dBConnection.execQuery(query)
    .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
    .catch((reject) => {
        res.statusCode = 409;
        if(reject) {
            res.send(`Ocurrió un error al intentar crear este registro. ID del error: ${reject}`)
        }else{
            res.send(`Ocurrió un error al intentar crear este registro. También ocurrió un error al crear la falla`)
        }

    })
})

app.put("/edit-user", async(req: Request, res: Response) => {
    const query: string = `UPDATE persons SET NAMEs="${req.body.name}", DOCUMENT_TYPE="${req.body.type}", DOCUMENT="${req.body.document}", AGE=${req.body.age}, TRANSPORT=${req.body.transport} WHERE ID=${req.query.id}`;
    await dBConnection.execQuery(query)
    .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
    .catch((reject) => {
        res.statusCode = 409;
        if(reject) {
            res.send(`Ocurrió un error al intentar editar este registro. ID del error: ${reject}`)
        }else{
            res.send(`Ocurrió un error al intentar editar este registro. También ocurrió un error al crear la falla`)
        }

    })
})


// TODO: check if have balance
app.delete("/delete-user", async(req: Request, res: Response) => {
    const query: string = `DELETE FROM persons WHERE ID=${req.query.id}`;
    await dBConnection.execQuery(query)
    .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
    .catch((reject) => {
        res.statusCode = 409;
        if(reject) {
            res.send(`Ocurrió un error al intentar eliminar este registro. ID del error: ${reject}`)
        }else{
            res.send(`Ocurrió un error al intentar eliminar este registro. También ocurrió un error al crear la falla`)
        }

    })
})

// TO DO: subquery to find ID
app.get("/user", async(req: Request, res: Response) => {
    const query: string = `SELECT * FROM persons WHERE PARENT_RELATIONSHIP = ${} OR ID = ${}`;
    await dBConnection.execQuery(query)
    .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
    .catch((reject) => {
        res.statusCode = 409;
        if(reject) {
            res.send(`Ocurrió un error al intentar enviar este registro. ID del error: ${reject}`)
        }else{
            res.send(`Ocurrió un error al intentar enviar este registro. También ocurrió un error al crear la falla`)
        }

    })
})

