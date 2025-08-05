"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        return new Promise((req, res) => { });
    }
    reportFailure(error) {
        return new Promise((req, res) => { });
    }
}
exports.default = DBConnection;
