const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'eventmonkey.xyz',
    user: 'dev',
    password: 'csc648',
    database: 'dev',
    connectionLimit: 5
});

/**
 * Queries the database with optional query values.
 *
 * @param sql the sql query to execute
 * @param [values] optional values to execute the query
 * @return {Array<any>} an array of rows as the result
 */
async function query(sql, values) {
    let conn;
    try {
        conn = await pool.getConnection();
        return await conn.query(sql, values);
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

module.exports.query = query;
