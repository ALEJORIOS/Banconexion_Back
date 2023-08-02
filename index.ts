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

app.get("/user", async(req: Request, res: Response) => {
    const query: string = `SELECT * FROM persons
    WHERE (DOCUMENT = ${req.query.document} AND DOCUMENT_TYPE = "${req.query.type}") OR
    PARENT_RELATIONSHIP = (SELECT ID FROM persons WHERE (DOCUMENT = ${req.query.document} AND DOCUMENT_TYPE = "${req.query.type}"))`;
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

app.post("/login", async(req: Request, res: Response) => {
    const query: string = `SELECT * FROM persons
    WHERE USER = "${req.body.user}" AND PASSWORD = "${req.body.password}" AND DOCUMENT = ${req.body.document}`
    await dBConnection.execQuery(query)
    .then((resolve) => {
        if(resolve.length > 0) {
            res.statusCode = 200;
            res.send("OK");
        }else{
            res.statusCode = 401;
            res.send("Usuario o contraseña erróneo")
        }
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

app.get("/fees", async(req: Request, res: Response) => {
    const query: string = `SELECT * FROM params WHERE 
        (ATTRIBUTE = "TARIFA_COMPLETA" OR 
        ATTRIBUTE = "TARIFA_NINO" OR 
        ATTRIBUTE = "TARIFA_BEBE" OR 
        ATTRIBUTE = "TARIFA_MENOR" OR 
        ATTRIBUTE = "TRANSPORTE")`;
    await dBConnection.execQuery(query)
    .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
    .catch((reject) => {
        res.statusCode = 409;
        if(reject) {
            res.send(`Ocurrió un error al intentar buscar este registro. ID del error: ${reject}`)
        }else{
            res.send(`Ocurrió un error al intentar buscar este registro. También ocurrió un error al crear la falla`)
        }
    })
})

app.get("/all-users", async(req: Request, res: Response) => {
    const query: string = `SELECT DOCUMENT_TYPE, DOCUMENT, NAME FROM persons`;
    await dBConnection.execQuery(query)
    .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
    .catch((reject) => {
        res.statusCode = 409;
        if(reject) {
            res.send(`Ocurrió un error al intentar buscar estos registro. ID del error: ${reject}`)
        }else{
            res.send(`Ocurrió un error al intentar buscar estos registro. También ocurrió un error al crear la falla`)
        }
    })
})