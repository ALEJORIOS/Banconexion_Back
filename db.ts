import mysql, { Connection, FieldInfo, MysqlError } from "mysql"

export default class DBConnection {
    public connection!: Connection;
    constructor(host: string, database: string, user: string, password: string) {
        this.connection = mysql.createConnection({
            host,
            database,
            user,
            password,
            port: 3308
        })
        this.connect();
    }
    
    public connect() {
        this.connection.connect((error) => {
            if(error) {
                console.error('Error al crear una conexión a la base de datos');
                console.error(error);
            }else{
                console.log('Success Connection to MySql');
            }
        })
    }

    public endConnection() {
        this.connection.end();
    }

    public async execQuery(query: string): Promise<any> {
        return new Promise<any>((res, rej) => {
            this.connection.query(query, async(error: MysqlError | null, results?: any, fields?: FieldInfo[]) => {
                if(error) {
                    await this.reportFailure(JSON.stringify(error)).then((resolve) => {
                        res(resolve)
                    })
                    .catch((reject) => {
                        rej(reject)
                    })
                }
                res(JSON.parse(JSON.stringify(results)));
            });
        })

    }

    private reportFailure(error: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const ErrorJson: any = JSON.parse(error);
            this.connection.query(`INSERT INTO failures(DATE, CODE, ERRNO, ERROR) VALUES(NOW(), '${ErrorJson.code}', '${ErrorJson.errno}','${ErrorJson.sql}')`, (error: MysqlError | null, results?: any) => {
                if(error) {
                    console.error("Error reportando la falla");
                    reject(0);
                }
                console.log('results: ', results);
                resolve(results.insertId)
            })
        })
    }
}