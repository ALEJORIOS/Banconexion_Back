"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import mysql, { Connection, FieldInfo, MysqlError } from "mysql"
const postgres_1 = __importDefault(require("postgres"));
class DBConnection {
    sql;
    constructor(host, database, username, password) {
        this.sql = (0, postgres_1.default)({
            host,
            database,
            username,
            password,
            port: 5432,
            ssl: true
        });
        console.log('Conectado');
    }
    async execQuery(query) {
        // return await this.connection`${query}`
        // return new Promise<any>((res, rej) => {
        //     this.connection.query(query, async(error: MysqlError | null, results?: any, fields?: FieldInfo[]) => {
        //         if(error) {
        //             await this.reportFailure(JSON.stringify(error)).then((resolve) => {
        //                 rej(resolve)
        //             })
        //             .catch((reject) => {
        //                 rej(reject)
        //             })
        //         }
        //         res(JSON.parse(JSON.stringify(results) || "{}"));
        //     });
        // })
        return new Promise((req, res) => { });
    }
    reportFailure(error) {
        // return new Promise((resolve, reject) => {
        // const ErrorJson: any = JSON.parse(error);
        // this.connection.query(`INSERT INTO failures(DATE, CODE, ERRNO, ERROR) VALUES(NOW(), '${ErrorJson.code}', '${ErrorJson.errno}','${ErrorJson.sql}')`, (error: MysqlError | null, results?: any) => {
        //     if(error) {
        //         reject(0);
        //     }
        //         resolve(results.insertId)
        //     })
        // })
        return new Promise((req, res) => { });
    }
}
exports.default = DBConnection;
