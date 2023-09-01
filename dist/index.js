"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const exceljs_1 = require("exceljs");
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Start Connection to DB
app.listen(process.env.PORT, () => {
    console.log('Listening on port ', process.env.PORT);
});
const dBConnection = new db_1.default("ep-rough-sea-49693752-pooler.us-east-1.postgres.vercel-storage.com", "Banconexion", "default", "1lWYvjDu6hfL");
const upperize = (obj) => Object.keys(obj).reduce((acc, k) => {
    acc[k.toUpperCase()] = obj[k];
    return acc;
}, {});
async function sendError(err) {
    return await dBConnection.sql `INSERT INTO FAILURES(DATE, ERROR) VALUES(NOW(),  ${err.toString()}) RETURNING ID;`
        .then((response) => {
        return response[0].id;
    });
}
/**
 * Check if project is in maintenance mode
 * @tested true
 */
app.get("/check-maintenance", async (req, res) => {
    await dBConnection.sql `SELECT * FROM params WHERE attribute = 'MAINTENANCE';`
        .then((response) => {
        res.statusCode = 200;
        res.send([upperize(response[0])]);
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
* Get all data user including their covers
* @returns and array of objects
* @tested tested for one person
*/
app.get("/user", async (req, res) => {
    const document = req.query.document;
    const type = req.query.type;
    await dBConnection.sql `SELECT * 
    FROM userview
    WHERE (document = ${document} AND document_type = ${type}) OR
    (SELECT id FROM persons WHERE (document = ${document} AND document_type= ${type})) = ANY (PARENT_RELATIONSHIP);`
        .then((response) => {
        res.statusCode = 200;
        res.send(response.map(user => upperize(user)));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * Register a new user
 * The admin value is 0 by default
 * @param name - string
 * @param type - string
 * @param document - string
 * @param age - number
 * @param transport - 1 0
 * @param area - string
 *
 * @returns an array with the new record
 * @tested true
 */
app.post("/register", async (req, res) => {
    await dBConnection.sql `INSERT INTO persons(NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT, AREA, ADMIN) VALUES (${req.body.name}, ${req.body.type}, ${req.body.document}, ${req.body.age}, ${req.body.transport}, ${req.body.area}, 0) RETURNING *;`
        .then((response) => {
        res.statusCode = 200;
        res.send(upperize(response[0]));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * Edit the user by ID
 * @param name - string
 * @param type - string
 * @param document - string
 * @param age - number
 * @param transport - 1 0
 * @param area - string
 * @param id - number
 * @returns an array with the record
 * @tested true
 */
app.put("/edit-user", async (req, res) => {
    await dBConnection.sql `UPDATE persons SET NAME=${req.body.name}, DOCUMENT_TYPE=${req.body.type}, DOCUMENT=${req.body.document}, AGE=${req.body.age}, TRANSPORT=${req.body.transport}, AREA=${req.body.area} WHERE ID=${req.query.id} RETURNING *;`
        .then((response) => {
        res.statusCode = 200;
        res.send(upperize(response[0]));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * Delete user if he/she hasn't transactions (Is not recommended for use)
 * @param id - number
 * @returns an empty array
 * @tested true
 */
app.delete("/delete-user", async (req, res) => {
    await dBConnection.sql `DELETE FROM persons WHERE ID=${req.query.id} AND (SELECT SUM(VALUE) FROM transactions WHERE transactions."userID" = ${req.query.id}) IS NULL RETURNING *;`
        .then((response) => {
        res.statusCode = 200;
        res.send(response);
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * Second login to admin user
 * @param password - string
 * @param document - string
 * @param type - string
 * @returns the data of the person connected
 * @tested true
 */
app.post("/login", async (req, res) => {
    await dBConnection.sql `SELECT * FROM persons WHERE PASSWORD = ${req.body.password} AND DOCUMENT = ${req.body.document} AND DOCUMENT_TYPE = ${req.body.type};`
        .then((response) => {
        res.statusCode = 200;
        res.send(upperize(response[0]));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * Obtain all the fees and transport value
 * @return array of object
 * @tested true
 */
app.get("/fees", async (req, res) => {
    dBConnection.sql `SELECT * FROM fees`
        .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * See all users
 * @returns array of objects
 * @tested true
 */
app.get("/all-users", async (req, res) => {
    await dBConnection.sql `SELECT DOCUMENT_TYPE, DOCUMENT, NAME, AREA FROM persons;`
        .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
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
app.post("/payment", async (req, res) => {
    await dBConnection.sql `INSERT INTO transactions(DATE, VALUE, "userID", AUTHORIZED, DONATION, CONFIRMED) VALUES(NOW(), ${req.body.value}, (SELECT ID FROM persons WHERE DOCUMENT_TYPE = ${req.body.type} AND DOCUMENT = ${req.body.document}), (SELECT ID FROM persons WHERE DOCUMENT_TYPE = ${req.body.authorizedBy.type} AND DOCUMENT = ${req.body.authorizedBy.document}), ${req.body.donation}, 0) RETURNING *;`
        .then((response) => {
        res.statusCode = 200;
        res.send(upperize(response[0]));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * See all transactions
 * @returns array of object
 * @tested true
 */
app.get("/transactions", async (req, res) => {
    await dBConnection.sql `SELECT * FROM transactionsView`
        .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * Return only the transactions of my group
 * @param id - number
 * @returns array of objects
 * @tested true
 */
app.get("/filtered-transactions", async (req, res) => {
    await dBConnection.sql `SELECT * FROM transactionsView t LEFT JOIN persons p ON t."userID" = p.id WHERE ("userID" = ${req.query.id} OR ${req.query.id} = ANY (PARENT_RELATIONSHIP));`
        .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * Edit a transaction value or donation status
 * @param id - number
 * @param value - number
 * @param donation - 1 0
 * @returns the recently edited record
 * @tested true
 */
app.put("/edit-transaction", async (req, res) => {
    await dBConnection.sql `UPDATE transactions SET VALUE = ${req.body.value}, DONATION = ${req.body.donation} WHERE ID = ${req.query.id} RETURNING *;`
        .then((response) => {
        res.statusCode = 200;
        res.send(upperize(response[0]));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * See all failures of the app
 * @param limit - number
 * @param skip - number
 * @tested true
 */
app.get("/failures", async (req, res) => {
    dBConnection.sql `SELECT * FROM failures 
    ORDER BY ID DESC 
    LIMIT ${req.query.limit || 20} OFFSET ${req.query.skip || 5};`
        .then((response) => {
        res.statusCode = 200;
        res.send(response.map(res => upperize(res)));
    })
        .catch(async (err) => {
        const errID = await sendError(err);
        res.statusCode = 409;
        res.send(`Ocurrió un error al intentar consultar este registro. ID del error: ${errID}`);
    });
});
/**
 * Auxiliar function for transactions excel
 */
async function getTransactions() {
    return await dBConnection.sql `SELECT * FROM transactionsview;`
        .then((resolve) => {
        return resolve;
    });
}
/**
 * Export all transactions as an excel
 * @returns an excel file
 * @tested true
 */
app.get("/export-transactions", async (req, res) => {
    try {
        let workbook = new exceljs_1.Workbook();
        const sheet = workbook.addWorksheet("transacciones");
        sheet.columns = [
            { header: "Fecha", key: "date", width: 25 },
            { header: "Tipo_Documento", key: "document_type", width: 10 },
            { header: "Documento", key: "document", width: 12 },
            { header: "Nombre", key: "name", width: 25 },
            { header: "Valor", key: "value", width: 10 },
            { header: "Autoriza", key: "authorized_by", width: 25 },
            { header: "Donacion", key: "donation", width: 5 },
            { header: "Confirmado", key: "confirmed", width: 5 }
        ];
        const OBJECT = await getTransactions();
        await OBJECT.map((value, index) => {
            sheet.addRow({
                date: value.date,
                document_type: value.document_type,
                document: value.document,
                name: value.name,
                value: value.value,
                authorized_by: value.authorized_by,
                donation: value.donation === 1 ? "Sí" : "No",
                confirmed: value.confirmed === 1 ? "Sí" : "No"
            });
        });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment;filename=" + "transacciones.xlsx");
        workbook.xlsx.write(res);
    }
    catch (error) {
        console.error(error);
    }
});
