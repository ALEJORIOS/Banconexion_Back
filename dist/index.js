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
/**
 * Register a new user
 * The admin value is 0 by default
 */
app.post("/register", async (req, res) => {
    const query = `INSERT INTO persons(NAME, DOCUMENT_TYPE, DOCUMENT, AGE, TRANSPORT, ADMIN) VALUES ("${req.body.name}", "${req.body.type}", "${req.body.document}", ${req.body.age}, ${req.body.transport}, 0)`;
    await dBConnection.execQuery(query)
        .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
        .catch((reject) => {
        res.statusCode = 409;
        if (reject) {
            res.send(`Ocurrió un error al intentar crear este registro. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al intentar crear este registro. También ocurrió un error al crear la falla`);
        }
    });
});
// TODO fix
app.put("/edit-user", async (req, res) => {
    const query = `UPDATE persons SET NAME="${req.body.name}", DOCUMENT_TYPE="${req.body.type}", DOCUMENT="${req.body.document}", AGE=${req.body.age}, TRANSPORT=${req.body.transport} WHERE ID=${req.query.id}`;
    await dBConnection.execQuery(query)
        .then((resolve) => {
        res.statusCode = 200;
        console.log('Entra biuen');
        res.send(resolve);
    })
        .catch((reject) => {
        res.statusCode = 409;
        if (reject) {
            res.send(`Ocurrió un error al intentar editar este registro. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al intentar editar este registro. También ocurrió un error al crear la falla`);
        }
    });
});
app.delete("/delete-user", async (req, res) => {
    const query = `DELETE FROM persons WHERE ID=${req.query.id} AND (SELECT SUM(VALUE) FROM transactions WHERE transactions.USER = ${req.query.id}) IS NULL`;
    await dBConnection.execQuery(query)
        .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
        .catch((reject) => {
        res.statusCode = 409;
        if (reject) {
            res.send(`Ocurrió un error al intentar eliminar este registro. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al intentar eliminar este registro. También ocurrió un error al crear la falla`);
        }
    });
});
app.get("/user", async (req, res) => {
    const query = `SELECT 
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
        if (reject) {
            res.send(`Ocurrió un error al intentar enviar este registro. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al intentar enviar este registro. También ocurrió un error al crear la falla`);
        }
    });
});
app.post("/login", async (req, res) => {
    const query = `SELECT * FROM persons
    WHERE USER = "${req.body.user}" AND PASSWORD = "${req.body.password}" AND DOCUMENT = ${req.body.document}`;
    await dBConnection.execQuery(query)
        .then((resolve) => {
        if (resolve.length > 0) {
            res.statusCode = 200;
            res.send("OK");
        }
        else {
            res.statusCode = 401;
            res.send("Usuario o contraseña erróneo");
        }
    })
        .catch((reject) => {
        res.statusCode = 409;
        if (reject) {
            res.send(`Ocurrió un error al intentar enviar este registro. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al intentar enviar este registro. También ocurrió un error al crear la falla`);
        }
    });
});
app.get("/fees", async (req, res) => {
    const query = `SELECT * FROM params WHERE 
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
        if (reject) {
            res.send(`Ocurrió un error al intentar buscar este registro. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al intentar buscar este registro. También ocurrió un error al crear la falla`);
        }
    });
});
app.get("/all-users", async (req, res) => {
    const query = `SELECT DOCUMENT_TYPE, DOCUMENT, NAME FROM persons`;
    await dBConnection.execQuery(query)
        .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
        .catch((reject) => {
        res.statusCode = 409;
        if (reject) {
            res.send(`Ocurrió un error al intentar buscar estos registro. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al intentar buscar estos registro. También ocurrió un error al crear la falla`);
        }
    });
});
app.post("/payment", async (req, res) => {
    const query = `INSERT INTO transactions(DATE, VALUE, USER, AUTHORIZED_BY, DONATION) 
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
        if (reject) {
            res.send(`Ocurrió un error al realizar este abono. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al realizar este abono. También ocurrió un error al crear la falla`);
        }
    });
});
app.get("/transactions", async (req, res) => {
    const query = `SELECT tr.ID, tr.DATE, tr.USER, p1.DOCUMENT_TYPE, p1.DOCUMENT, p1.NAME, p2.NAME AS AUTHORIZED_BY, tr.DONATION FROM transactions as tr
    LEFT JOIN persons as p1 ON tr.USER = p1.ID
    LEFT JOIN persons as p2 ON tr.AUTHORIZED_BY = p2.ID`;
    await dBConnection.execQuery(query)
        .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
        .catch((reject) => {
        res.statusCode = 409;
        if (reject) {
            res.send(`Ocurrió un error al realizar este abono. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al realizar este abono. También ocurrió un error al crear la falla`);
        }
    });
});
app.put("/edit-transaction", async (req, res) => {
    const query = `UPDATE transactions SET VALUE = ${req.body.value}, DONATION = ${req.body.donation} WHERE ID = ${req.query.id}`;
    await dBConnection.execQuery(query)
        .then((resolve) => {
        res.statusCode = 200;
        res.send(resolve);
    })
        .catch((reject) => {
        res.statusCode = 409;
        if (reject) {
            res.send(`Ocurrió un error al realizar este abono. ID del error: ${reject}`);
        }
        else {
            res.send(`Ocurrió un error al realizar este abono. También ocurrió un error al crear la falla`);
        }
    });
});
