import { configDotenv } from "dotenv";
import express, { Express, Request, Response } from "express";
import DBConnection from "./db";
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

const dBConnection = new DBConnection("ep-rough-sea-49693752-pooler.us-east-1.postgres.vercel-storage.com", "Banconexion", "default", "1lWYvjDu6hfL");

const upperize = (obj: any) =>
  Object.keys(obj).reduce((acc: any, k) => {
    acc[k.toUpperCase()] = obj[k];
    return acc;
  }, {});


async function sendError(err: string): Promise<number> {
    return await dBConnection.sql`INSERT INTO FAILURES(DATE, ERROR) VALUES(NOW(),  ${err.toString()}) RETURNING ID;`
    .then((response) => {
        return response[0].id;
    })
}

/**
 * Check if project is in maintenance mode
 */
app.get("/check-maintenance", async(req: Request, res: Response) => {
    await dBConnection.sql`SELECT * FROM params WHERE attribute = 'MAINTENANCE';`
    .then((response: any) => {
        res.statusCode = 200;
        res.send([upperize(response)]);
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

app.get("/user", async(req: Request, res: Response) => {
    const document: string = req.query.document as string;
    const type: string = req.query.type as string;
    await dBConnection.sql`SELECT 
    p.id, 
    p.document_type, 
    p.document, 
    p.name, 
    p.age, 
    p.transport, 
    p.admin,
    a.name as area,
    (select SUM(value) FROM transactions WHERE "userID" = p.ID) AS balance
    FROM persons AS p
    JOIN areas AS a ON a.abbr = p.area
    WHERE (p.document = ${document} AND p.document_type = ${type}) OR
    (SELECT id FROM persons AS p WHERE (p.document = ${document} AND p.document_type= ${type})) = ANY (PARENT_RELATIONSHIP);`
    .then((response) => {
        res.statusCode = 200;
        res.send(response.map(user => upperize(user)))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

/**
 * Register a new user 
 * The admin value is 0 by default
 */
app.post("/register", async(req: Request, res: Response) => {
    const query: string = `INSERT INTO persons(NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT, AREA, ADMIN) VALUES ("${req.body.name}", "${req.body.type}", "${req.body.document}", ${req.body.age}, ${req.body.transport}, "${req.body.area}", 0)`;
    await dBConnection.execQuery(query)
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

app.put("/edit-user", async(req: Request, res: Response) => {
    const query: string = `UPDATE persons SET NAME="${req.body.name}", DOCUMENT_TYPE="${req.body.type}", DOCUMENT="${req.body.document}", AGE=${req.body.age}, TRANSPORT=${req.body.transport} WHERE ID=${req.query.id}`;
    await dBConnection.execQuery(query)
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

app.delete("/delete-user", async(req: Request, res: Response) => {
    const query: string = `DELETE FROM persons WHERE ID=${req.query.id} AND (SELECT SUM(VALUE) FROM transactions WHERE transactions.USER = ${req.query.id}) IS NULL`;
    await dBConnection.execQuery(query)
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})


app.post("/login", async(req: Request, res: Response) => {
    const query: string = `SELECT * FROM "PERSONS"
    WHERE USER = '${req.body.user}' AND PASSWORD = '${req.body.password}' AND DOCUMENT = ${req.body.document};`
    await dBConnection.execQuery(query)
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
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
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

app.get("/all-users", async(req: Request, res: Response) => {
    const query: string = `SELECT DOCUMENT_TYPE, DOCUMENT, NAME, AREA FROM persons`;
    await dBConnection.execQuery(query)
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
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
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

app.get("/transactions", async(req: Request, res: Response) => {
    const query: string = `SELECT tr.ID, tr.DATE, tr.VALUE, tr.USER, p1.DOCUMENT_TYPE, p1.DOCUMENT, p1.NAME, p2.NAME AS AUTHORIZED_BY, tr.DONATION FROM transactions as tr
    LEFT JOIN persons as p1 ON tr.USER = p1.ID
    LEFT JOIN persons as p2 ON tr.AUTHORIZED_BY = p2.ID`;
    await dBConnection.execQuery(query)
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

app.put("/edit-transaction", async(req: Request, res: Response) => {
    const query: string = `UPDATE transactions SET VALUE = ${req.body.value}, DONATION = ${req.body.donation} WHERE ID = ${req.query.id}`;
    await dBConnection.execQuery(query)
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

app.get("/failures", async(req: Request, res: Response) => {
    const query: string = `SELECT * FROM failures ORDER BY ID DESC LIMIT ${req.query.skip || 0},${req.query.limit || 20}`;
    await dBConnection.execQuery(query)
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
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

})


