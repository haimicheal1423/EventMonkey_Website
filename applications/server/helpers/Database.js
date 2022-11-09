import mariadb from 'mariadb';

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
     * @param {string} sql the sql query to execute
     * @param {any|any[]} [values] optional values to execute the query
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

    /**
     * Runs a batched query.
     *
     * @param {string} sql the sql query to execute
     * @param {any|any[]} values values to execute the batched query
     * @returns {Promise<mariadb.UpsertResult>
     *         | Promise<mariadb.UpsertResult[]>} the database result
     */
    static async batch(sql, values) {
        let conn;
        try {
            conn = await pool.getConnection();
            return await conn.batch(sql, values);
        } catch (err) {
            throw err;
        } finally {
            if (conn) {
                await conn.release();
            }
        }
    }
}
