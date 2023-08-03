import { configDotenv } from "dotenv";
import express, { Express, Request, Response } from "express";
import DBConnection from "./db";
import { FieldInfo, MysqlError } from "mysql";
import { Workbook } from "exceljs";
import cors from "cors"

configDotenv();

const app: Express = express();

app.use(express.json())

app.use(cors());

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
    const query: string = `UPDATE persons SET NAME="${req.body.name}", DOCUMENT_TYPE="${req.body.type}", DOCUMENT="${req.body.document}", AGE=${req.body.age}, TRANSPORT=${req.body.transport} WHERE ID=${req.query.id}`;
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

app.delete("/delete-user", async(req: Request, res: Response) => {
    const query: string = `DELETE FROM persons WHERE ID=${req.query.id} AND (SELECT SUM(VALUE) FROM transactions WHERE transactions.USER = ${req.query.id}) IS NULL`;
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
    const query: string = `SELECT 
        p.ID, 
        p.DOCUMENT_TYPE, 
        p.DOCUMENT, 
        p.NAME, 
        p.AGE, 
        p.TRANSPORT, 
        p.ADMIN, 
        (select SUM(VALUE) FROM transactions WHERE USER = p.ID) AS BALANCE 
        FROM persons AS p
        WHERE (p.DOCUMENT = ${req.query.document} AND p.DOCUMENT_TYPE = "${req.query.type}") OR
        PARENT_RELATIONSHIP = (SELECT ID FROM persons AS p WHERE (p.DOCUMENT = ${req.query.document} AND p.DOCUMENT_TYPE = "${req.query.type}"))`;
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

app.post("/payment", async(req: Request, res: Response) => {
    const query: string = `INSERT INTO transactions(DATE, VALUE, USER, AUTHORIZED_BY, DONATION) 
    VALUES(NOW(), 
        ${req.body.value}, 
        (SELECT ID FROM persons WHERE DOCUMENT_TYPE = "${req.body.type}" AND DOCUMENT = "${req.body.document}"), 
        (SELECT ID FROM persons WHERE DOCUMENT_TYPE = "${req.body.authorizedBy.type}" AND DOCUMENT = "${req.body.authorizedBy.document}"), 
        ${req.body.donation})`;

    await dBConnection.execQuery(query)
    .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
    .catch((reject) => {
        res.statusCode = 409;
        if(reject) {
            res.send(`Ocurrió un error al realizar este abono. ID del error: ${reject}`)
        }else{
            res.send(`Ocurrió un error al realizar este abono. También ocurrió un error al crear la falla`)
        }
    })
})

app.get("/transactions", async(req: Request, res: Response) => {
    const query: string = `SELECT tr.ID, tr.DATE, tr.VALUE, tr.USER, p1.DOCUMENT_TYPE, p1.DOCUMENT, p1.NAME, p2.NAME AS AUTHORIZED_BY, tr.DONATION FROM transactions as tr
    LEFT JOIN persons as p1 ON tr.USER = p1.ID
    LEFT JOIN persons as p2 ON tr.AUTHORIZED_BY = p2.ID`;
    await dBConnection.execQuery(query)
    .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
    .catch((reject) => {
        res.statusCode = 409;
        if(reject) {
            res.send(`Ocurrió un error al ver las transacciones. ID del error: ${reject}`)
        }else{
            res.send(`Ocurrió un error al ver las transacciones. También ocurrió un error al crear la falla`)
        }
    })
})

app.put("/edit-transaction", async(req: Request, res: Response) => {
    const query: string = `UPDATE transactions SET VALUE = ${req.body.value}, DONATION = ${req.body.donation} WHERE ID = ${req.query.id}`;
    await dBConnection.execQuery(query)
    .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
    .catch((reject) => {
        res.statusCode = 409;
        if(reject) {
            res.send(`Ocurrió un error al editar esta transacción. ID del error: ${reject}`)
        }else{
            res.send(`Ocurrió un error al editar esta transacción. También ocurrió un error al crear la falla`)
        }
    })
})

app.get("/export-transactions", async(req: Request, res: Response) => {
    try {
        let workbook = new Workbook();

        const sheet = workbook.addWorksheet("transacciones");
        sheet.columns = [
            {header: "Fecha", key: "DATE", width: 25},
            {header: "Tipo_Documento", key: "DOCUMENT_TYPE", width: 10},
            {header: "Documento", key: "DOCUMENT", width: 12},
            {header: "Nombre", key: "NAME", width: 25},
            {header: "Valor", key: "VALUE", width: 10},
            {header: "Autoriza", key: "AUTHORIZED_BY", width: 25},
            {header: "Donacion", key: "DONATION", width: 5}
        ]
    
        const OBJECT = await getTransactions();      
        await OBJECT.map((value: any, index: number) => {
            sheet.addRow({
                DATE: value.DATE,
                DOCUMENT_TYPE: value.DOCUMENT_TYPE,
                DOCUMENT: value.DOCUMENT,
                NAME: value.NAME,
                VALUE: value.VALUE,
                AUTHORIZED_BY: value.AUTHORIZED_BY,
                DONATION: value.DONATION === 1 ? "Sí" : "No"
            })
        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "transactions.xlsx"
        )

        workbook.xlsx.write(res);

    } catch (error) {
        console.error(error);
    }

    // "ID": 6,
    // "DATE": "2023-08-02T21:58:24.000Z",
    // "VALUE": 100,
    // "USER": 9,
    // "DOCUMENT_TYPE": "CC",
    // "DOCUMENT": "1032488686",
    // "NAME": "Alejandro Rios",
    // "AUTHORIZED_BY": "Nicole Soto",
    // "DONATION": 0
})

async function getTransactions() {
    const query: string = `SELECT tr.ID, tr.DATE, tr.VALUE, tr.USER, p1.DOCUMENT_TYPE, p1.DOCUMENT, p1.NAME, p2.NAME AS AUTHORIZED_BY, tr.DONATION FROM transactions as tr
    LEFT JOIN persons as p1 ON tr.USER = p1.ID
    LEFT JOIN persons as p2 ON tr.AUTHORIZED_BY = p2.ID`;
    return await dBConnection.execQuery(query)
    .then((resolve) => {
        return resolve
    })
}