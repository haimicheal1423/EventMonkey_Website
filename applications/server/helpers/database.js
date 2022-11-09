import mariadb from "mariadb";

const pool = mariadb.createPool({
    host: 'eventmonkey.xyz',
    user: 'dev',
    password: 'csc648',
    database: 'dev',
    connectionLimit: 5
});

export class Database {

    /**
     * Queries the database with optional query values.
     *
     * @param sql the sql query to execute
     * @param [values] optional values to execute the query
     * @returns {any} the database result
     */
    static async query(sql, values) {
        let conn;
        try {
            conn = await pool.getConnection();
            return await conn.query(sql, values);
        } catch (err) {
            throw err;
        } finally {
            if (conn) {
                await conn.release();
            }
        }
    }
}


// async function asyncFunction() {
//   let conn;
//   try {
//     conn = await pool.getConnection();
//     const rows = await conn.query("SELECT name from Event");
//     console.table(rows);
//   } catch (err) {
//     throw err;
//   } finally {
//     if (conn) {
//       await conn.end();
//     }
//   }
// }

// asyncFunction();
