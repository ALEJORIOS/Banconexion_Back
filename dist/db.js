"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
class DBConnection {
    connection;
    constructor(host, database, user, password) {
        this.connection = mysql_1.default.createConnection({
            host,
            database,
            user,
            password,
            port: 3308
        });
    }
    connect() {
        this.connection.connect((error) => {
            if (error) {
                console.error('Error al crear una conexión a la base de datos');
                console.error(error);
            }
            else {
                console.log('Success Connection to MySql');
            }
        });
    }
    endConnection() {
        this.connection.end();
    }
    async execQuery(query) {
        this.connect();
        return new Promise((res, rej) => {
            this.connection.query(query, async (error, results, fields) => {
                if (error) {
                    await this.reportFailure(JSON.stringify(error)).then((resolve) => {
                        res(resolve);
                    })
                        .catch((reject) => {
                        rej(reject);
                    });
                }
                res(JSON.parse(JSON.stringify(results)));
            });
        });
    }
    reportFailure(error) {
        return new Promise((resolve, reject) => {
            const ErrorJson = JSON.parse(error);
            this.connection.query(`INSERT INTO failures(DATE, CODE, ERRNO, ERROR) VALUES(NOW(), '${ErrorJson.code}', '${ErrorJson.errno}','${ErrorJson.sql}')`, (error, results) => {
                if (error) {
                    console.error("Error reportando la falla");
                    reject(0);
                }
                console.log('results: ', results);
                resolve(results.insertId);
            });
        });
    }
}
exports.default = DBConnection;
