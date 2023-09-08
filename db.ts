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
        return new Promise<any>((req, res) => {})
    }
    
    private reportFailure(error: string): Promise<number> {
        return new Promise<any>((req, res) => {})
    }
}