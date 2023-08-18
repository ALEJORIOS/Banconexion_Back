// import mysql, { Connection, FieldInfo, MysqlError } from "mysql"
import postgres from "postgres";

export default class DBConnection {
    public sql!: postgres.Sql;
    constructor(host: string, database: string, username: string, password: string) {
        this.sql = postgres({
            host,
            database,
            username,
            password,
            port: 5432,
            ssl: true
        })
        console.log('Conectado');
    }

    public async execQuery(query: string): Promise<any> {
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
        return new Promise<any>((req, res) => {})
    }
    
    private reportFailure(error: string): Promise<number> {
        // return new Promise((resolve, reject) => {
        // const ErrorJson: any = JSON.parse(error);
        // this.connection.query(`INSERT INTO failures(DATE, CODE, ERRNO, ERROR) VALUES(NOW(), '${ErrorJson.code}', '${ErrorJson.errno}','${ErrorJson.sql}')`, (error: MysqlError | null, results?: any) => {
        //     if(error) {
        //         reject(0);
        //     }
        //         resolve(results.insertId)
        //     })
        // })
        return new Promise<any>((req, res) => {})
    }
}