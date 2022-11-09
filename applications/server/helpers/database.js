const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'eventmonkey.xyz',
  user: 'dev',
  password: 'csc648',
  database: 'dev',
  connectionLimit: 5
});

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
module.exports = pool;
