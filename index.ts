import { configDotenv } from "dotenv";
import express, { Express, Request, Response, response } from "express";
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
 * API
 */
app.get("/", (req: Request, res: Response) => {
    res.send("Banconexión API v 1.1.0")
})

/**
 * Check if project is in maintenance mode
 * @tested true
 */
app.get("/check-maintenance", async(req: Request, res: Response) => {
    await dBConnection.sql`SELECT * FROM params WHERE attribute = 'MAINTENANCE';`
    .then((response: any) => {
        res.statusCode = 200;
        res.send([upperize(response[0])]);
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este Registro. ID del error: ${errID}`);
    })
})

/**
* Get all data user including their covers
* @returns and array of objects
* @tested tested for one person
*/

app.get("/user", async(req: Request, res: Response) => {
    const document: string = req.query.document as string;
    const type: string = req.query.type as string;
    await dBConnection.sql`SELECT * 
    FROM userview
    WHERE (document = ${document} AND document_type = ${type}) OR
    (SELECT id FROM persons WHERE (document = ${document} AND document_type= ${type})) = ANY (PARENT_RELATIONSHIP);`
    .then(async(response) => {
        res.statusCode = 200;
        const fees = await getFees();
        response.forEach(user => user.goal = getCurrentFee(fees, user.age, user.transport === 1));
        const headIndex: number = response.findIndex(user => user.document === document);
        const familyHead = response[headIndex];
        response.splice(headIndex, 1);
        response.splice(0, 0, familyHead);
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
 * @param name - string
 * @param type - string
 * @param document - string
 * @param age - number
 * @param transport - 1 0
 * @param area - string
 * @param guest - number (person who invited the campist)
 * @param phone - number 
 * @param registered_by - number (id of the gam member who carried out the registry)
 * 
 * @returns an array with the new record
 * @tested true
 */
app.post("/register", async(req: Request, res: Response) => {
    await dBConnection.sql`INSERT INTO persons(NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT, AREA, ADMIN, GUEST, REGISTERED_BY, PHONE) VALUES (${req.body.name}, ${req.body.type}, ${req.body.document}, ${req.body.age}, ${req.body.transport}, ${req.body.area}, 0, ${req.body.guest}, ${req.body.registered_by}, ${req.body.phone}) RETURNING *;`
    .then((response) => {
        res.statusCode = 200;
        res.send(upperize(response[0]))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

/**
 * Edit the user by ID 
 * @param name - string
 * @param type - string
 * @param document - string
 * @param age - number
 * @param transport - 1 0
 * @param area - string
 * @param id - number
 * @param phone - string
 * @returns an array with the record
 * @tested true
 */
app.put("/edit-user", async(req: Request, res: Response) => {
    
    await dBConnection.sql`UPDATE persons SET NAME=${req.body.name}, ADMIN=${req.body.admin}, DOCUMENT_TYPE=${req.body.type}, DOCUMENT=${req.body.document}, AGE=${req.body.age}, TRANSPORT=${req.body.transport}, AREA=${req.body.area}, PHONE=${req.body.phone} WHERE ID=${req.query.id as string} RETURNING *;`
    .then(async(response) => {
        if(req.body.password) {
            await updatePassword(req.body.password, req.body.type, req.body.document).then((response2: HttpStatus) => {
                res.statusCode = response2.code;
                res.send(response2.response);
            })
            .catch((error) => {
                res.statusCode = error.code;
                res.send(error.response);
            })
        }else{
            res.statusCode = 200;
            res.send(upperize(response[0]))
        }
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar editar este registro. ID del error: ${errID}`);
    })
})

async function updatePassword(password: string, docType: string, document: number): Promise<HttpStatus> {
    return new Promise(async(res, rej) => {
        await dBConnection.sql`UPDATE persons SET PASSWORD=${password} WHERE DOCUMENT_TYPE=${docType} AND DOCUMENT=${document} RETURNING *;`
        .then((response) => {
            res({code: 200, response: upperize(response[0])})
        })
        .catch(async(err) => {
            const errID = await sendError(err);
            rej({code: 409, response: upperize(`Ocurrió un error al intentar editar este registro. ID del error: ${errID}`)})
        })
    })
}

/**
 * Get the campist of all the area
 * @param area - string
 * @returns array of objects
 * @tested true
 */
app.get("/area", async(req: Request, res: Response) => {
    await dBConnection.sql`SELECT * FROM userview WHERE area = (SELECT name FROM areas WHERE abbr = ${req.query.area as string});`
    .then(async(response) => {
        res.statusCode = 200;
        const fees = await getFees();
        response.forEach(user => user.goal = getCurrentFee(fees, user.age, user.transport === 1));
        res.send(response.map(user => upperize(user)))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar estos registros. ID del error: ${errID}`);
    })
})

/**
 * Get all the relations of a camper
 * @param document - string
 * @param type - string
 * @returns array of objects
 * @tested true
 */
app.get("/relationships", async(req: Request, res: Response) => {
    await dBConnection.sql`SELECT * FROM userview WHERE (SELECT id FROM persons WHERE (document = ${req.query.document as string} AND document_type= ${req.query.type as string})) = ANY (PARENT_RELATIONSHIP);`
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar estos registros. ID del error: ${errID}`);
    })
})

/**
 * Add children to user
 * @param children - string[]
 * @param id - number
 * @returns array of objects updated
 * @tested true
 */
app.post("/relationships", async(req: Request, res: Response) => {
    const where: number[] = req.body.children;
    await dBConnection.sql`UPDATE persons SET parent_relationship = array_append(parent_relationship, ${+req.body.id}) WHERE id IN ${ dBConnection.sql(where) } RETURNING *;`
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar agregar a estos registros. ID del error: ${errID}`);
    })
})

/**
 * Update all children to user
 * @param children - string[]
 * @param id - number
 * @returns array of objects updated
 * @tested false
 */
app.put("/relationships", async(req: Request, res: Response) => {
    const where: number[] = req.body.children;
    await dBConnection.sql`UPDATE persons SET parent_relationship = array_remove(parent_relationship, ${+req.body.id}) RETURNING *;`
    await dBConnection.sql`UPDATE persons SET parent_relationship = array_append(parent_relationship, ${+req.body.id}) WHERE id IN ${ dBConnection.sql(where) } RETURNING *;`
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar actualizar a estos registros. ID del error: ${errID}`);
    })
})

/**
 * Remove children to user
 * @param children - string[]
 * @param id - number
 * @returns array of objects updated
 * @tested true
 */
app.delete("/relationships", async(req: Request, res: Response) => {
    const where: number[] = req.body.children;
    await dBConnection.sql`UPDATE persons SET parent_relationship = array_remove(parent_relationship, ${+req.body.id}) WHERE id IN ${ dBConnection.sql(where) } RETURNING *;`
    .then((response) => {
        res.statusCode = 200;
        res.send(response)
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar eliminar a estos registros. ID del error: ${errID}`);
    })
})

/**
 * Delete user if he/she hasn't transactions (Is not recommended for use)
 * @param id - number
 * @returns an empty array
 * @tested true
 */
app.delete("/delete-user", async(req: Request, res: Response) => {
    await dBConnection.sql`DELETE FROM persons WHERE ID=${req.query.id as string} AND (SELECT SUM(VALUE) FROM transactions WHERE transactions."userID" = ${req.query.id as string}) IS NULL RETURNING *;`
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

/**
 * Second login to admin user
 * @param password - string
 * @param document - string
 * @param type - string
 * @returns the data of the person connected
 * @tested true
 */
app.post("/login", async(req: Request, res: Response) => {
    await dBConnection.sql`SELECT * FROM persons WHERE PASSWORD = ${req.body.password} AND DOCUMENT = ${req.body.document} AND DOCUMENT_TYPE = ${req.body.type};`
    .then(async(response) => {
        if(response.length) {
            res.statusCode = 200;
            res.send(response.map(res => upperize(res)))
        }else{
            await dBConnection.sql`SELECT * FROM persons WHERE PASSWORD IS NULL AND DOCUMENT = ${req.body.document} AND DOCUMENT_TYPE = ${req.body.type};`
            .then((response2) => {
                if(response2.length) {
                    res.statusCode = 200;
                    res.send(response.map(res => upperize(res)))
                }else{
                    res.statusCode = 409;
                    res.send(response.map(res => upperize(res)))
                }
            })
            .catch(async(err) => {
                const errID = await sendError(err);
                res.statusCode = 409;
                res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
            })
        }
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

/**
 * Obtain all the fees and transport value
 * @return array of object
 * @tested true
 */

app.get("/fees", async(req: Request, res: Response) => {
    dBConnection.sql`SELECT * FROM fees`
    .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

/**
 * See all users
 * @returns array of objects
 * @tested true
 */

app.get("/all-users", async(req: Request, res: Response) => {
    await dBConnection.sql`SELECT ID, DOCUMENT_TYPE, DOCUMENT, AGE, NAME, PHONE, TRANSPORT, AREA, ADMIN, INVITED FROM userview;`
    .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

/**
 * Add a new transaction
 * @param value - number
 * @param type - string
 * @param document - string
 * @param authorizedBy - object
 *  @param type - stirng
 *  @param document - string
 * @param donation 1 0
 * @returns the record recently inserted
 * @tested true
 */

app.post("/payment", async(req: Request, res: Response) => {
    await dBConnection.sql`INSERT INTO transactions(DATE, VALUE, "userID", AUTHORIZED, DONATION, CONFIRMED) VALUES(NOW(), ${req.body.value}, (SELECT ID FROM persons WHERE DOCUMENT_TYPE = ${req.body.type} AND DOCUMENT = ${req.body.document}), (SELECT ID FROM persons WHERE DOCUMENT_TYPE = ${req.body.authorizedBy.type} AND DOCUMENT = ${req.body.authorizedBy.document}), ${req.body.donation}, 0) RETURNING *;`
    .then((response) => {
        res.statusCode = 200;
        res.send(upperize(response[0]))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

/**
 * See all transactions
 * @returns array of object
 * @tested true
 */

app.get("/transactions", async(req: Request, res: Response) => {
    await dBConnection.sql`SELECT * FROM transactionsView`
    .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

/**
 * Return only the transactions of my group
 * @param id - number
 * @returns array of objects
 * @tested true
 */
app.get("/filtered-transactions", async(req: Request, res: Response) => {
    await dBConnection.sql`SELECT t.ID, t.DONATION, t.NAME, t.VALUE, t.DOCUMENT, t.DOCUMENT_TYPE, t.DATE, t.AUTHORIZED_BY, t.CONFIRMED FROM transactionsView t LEFT JOIN persons p ON t."userID" = p.id WHERE ("userID" = ${req.query.id as string} OR ${req.query.id as string} = ANY (PARENT_RELATIONSHIP));`
    .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

/**
 * Edit a transaction value or donation status
 * @param id - number
 * @param value - number
 * @param donation - 1 0
 * @returns the recently edited record
 * @tested true
 */
app.put("/edit-transaction", async(req: Request, res: Response) => {
    await dBConnection.sql`UPDATE transactions SET VALUE = ${req.body.value}, DONATION = ${req.body.donation} WHERE ID = ${req.query.id as string} RETURNING *;`
    .then((response) => {
        res.statusCode = 200;
        res.send(upperize(response[0]))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este Registro. ID del error: ${errID}`);
    })
})

/**
 * Transaction approval by admin 2
 * @param ids - array of number
 * @returns array of object who changed
 * @tested true
 */
app.put("/transaction-approval", async(req: Request, res: Response) => {
    dBConnection.sql`UPDATE transactions SET confirmed = 1 WHERE ID IN ${dBConnection.sql(req.body.ids)} RETURNING *;`
    .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar actualizar estos registros. ID del error: ${errID}`);
    })
})


/**
 * See all failures of the app
 * @param limit - number
 * @param skip - number
 * @tested true
 */
app.get("/failures", async(req: Request, res: Response) => {
    dBConnection.sql`SELECT * FROM failures 
    ORDER BY ID DESC 
    LIMIT ${req.query.limit as never || 20} OFFSET ${req.query.skip as never || 5};`
    .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)))
    })
    .catch(async(err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    })
})

/**
 * Auxiliar function for transactions excel
 */
async function getTransactions(): Promise<any> {
    return await dBConnection.sql`SELECT * FROM transactionsview;`
    .then((resolve) => {
        return resolve
    })
}

/**
 * Export all transactions as an excel
 * @returns an excel file
 * @tested true
 */
app.post("/export-transactions", async(req: Request, res: Response) => {
    try {
        let workbook = new Workbook();

        const sheet = workbook.addWorksheet("transacciones");
        sheet.columns = [
            {header: "Fecha", key: "date", width: 25},
            {header: "Tipo_Documento", key: "document_type", width: 10},
            {header: "Documento", key: "document", width: 12},
            {header: "Nombre", key: "name", width: 25},
            {header: "Valor", key: "value", width: 10},
            {header: "Autoriza", key: "authorized_by", width: 25},
            {header: "Donacion", key: "donation", width: 5},
            {header: "Confirmado", key: "confirmed", width: 5}
        ]
    
        const OBJECT = await getTransactions();      
        await OBJECT.map((value: any, index: number) => {
            sheet.addRow({
                date: value.date,
                document_type: value.document_type,
                document: value.document,
                name: value.name,
                value: value.value,
                authorized_by: value.authorized_by,
                donation: value.donation === 1 ? "Sí" : "No",
                confirmed: value.confirmed === 1 ? "Sí" : "No"
            })
        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "transacciones.xlsx"
        )

        workbook.xlsx.write(res);

    } catch (error) {
        console.error(error);
    }
})

/**
 * Auxiliar function for report excel
 */
async function getReport(): Promise<any> {
    return await dBConnection.sql`SELECT * FROM userview;`
    .then((resolve) => {
        return resolve
    })
}

/**
 * Auxiliar function for report excel
 */
async function getFees(): Promise<any>{
    return await dBConnection.sql`SELECT * FROM fees`
    .then((resolve) => {
        return resolve
    })
}

/**
 * Auxiliar function for report excel
 */
function getCurrentFee(fees: any, age: number, transport: boolean): number{
    let value: number = 0;
    if(age < 2) {
      return 0
    }else if(age < 5) {
      value = +fees.filter((fee: any) => fee.attribute === "TARIFA_NINO")[0].value;
    }else if(age < 12) {
      value = +fees.filter((fee: any) => fee.attribute === "TARIFA_MENOR")[0].value;
    }else if(age >= 12) {
      value = +fees.filter((fee: any) => fee.attribute === "TARIFA_COMPLETA")[0].value;
    }
    // Add transport
    if(transport) {
      value += +fees.filter((fee: any) => fee.attribute === "TRANSPORT")[0].value;
    }
    return value;
}

/**
 * Export report in excel file
 * @returns an excel file
 * @tested true
 */
app.post("/export-report", async(req: Request, res: Response) => {
    const fees = await getFees();
    try {
        let workbook = new Workbook();

        const sheet = workbook.addWorksheet("resumen");
        sheet.columns = [
            {header: "Nombre", key: "name", width: 25},
            {header: "Edad", key: "age", width: 10},
            {header: "Celular", key: "phone", width: 12},
            {header: "Area", key: "area", width: 25},
            {header: "Invitado Por", key: "host", width: 10},
            {header: "Transporte", key: "transport", width: 25},
            {header: "Total Abonado", key: "total", width: 15},
            {header: "Total Meta", key: "goal", width: 15},
            {header: "Diferencia", key: "difference", width: 15}
        ]

        const OBJECT = await getReport();
        await OBJECT.map((value: any, index: number) => {
            const goal: number = getCurrentFee(fees, value.age, value.transport === 1 ? true : false);
            sheet.addRow({
                name: value.name,
                age: value.age,
                phone: value.phone,
                area: value.area,
                host: value.invited,
                transport: value.transport, 
                total: +value.balance,
                goal,
                difference: goal - value.balance
            })
        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "reporte_general.xlsx"
        )

        res.statusCode = 200;

        workbook.xlsx.write(res).then(() => {res.statusCode = 409})

    } catch (error) {
        console.error(error);
    }
})

interface HttpStatus {
    code: number,
    response: string
}