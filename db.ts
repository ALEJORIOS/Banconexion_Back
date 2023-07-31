import mysql, { Connection } from "mysql"

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

        this.connect()
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
}