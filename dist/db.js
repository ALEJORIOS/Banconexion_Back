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
        this.connect();
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
}
exports.default = DBConnection;
