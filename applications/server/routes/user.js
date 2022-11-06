const express = require('express');
const router = express.Router();
const pool = require("../helpers/database");
const bcrypt = require("bcrypt");

const status = require("http-status");

router.get("/", async function (req, res) {
    try {
        const sqlQuery = 'SELECT * FROM User';
        const rows = await pool.query(sqlQuery, req.params);
        res.status(200).json(rows);
    } catch (error) {
        res.status(400).send(error.message);
    }
})
router.get('/:id', async function (req, res) {
    try {
        const sqlQuery = 'SELECT user_id, email, password FROM User WHERE user_id=?';
        const rows = await pool.query(sqlQuery, req.params.id);
        res.status(200).json(rows);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/register', async function (req, res) {
    try {
        const { type, username, email, password } = req.body;

        const encryptedPassword = await bcrypt.hash(password, 10)

        const sqlQuery = 'INSERT INTO User (type, username, email, password) VALUES (?,?,?,?)';
        const result = await pool.query(sqlQuery, [type, username, email, encryptedPassword]);

        res.status(200).json({ userId: result.insertId });
    } catch (error) {
        res.status(400).send(error.message)
    }
});
//authenticate user
router.post('/login', async function (req, res, next) {

    var email = req.body.email;
    var password = req.body.password;

    console.log("email: ", email + " password: ", password);
    const results = await pool.query('SELECT * FROM User WHERE email = ?', [email]);

    console.log(results);

    if (!results || !results.length || !results[0])
        res.status(status.NOT_ACCEPTABLE).send('Invalid username or password.');
    else
        bcrypt.compare(password, results[0].password, (err, response) => {
            if (err) {
                res.status(status.INTERNAL_SERVER_ERROR).json(err)
                return;
            }

            if (response) {
            //     req.session.success = true;
            //     req.session.email = email;
            //     req.session.userId = results[0].id;

                res.cookie('email', results[0].email || '');
                res.cookie('name', results[0].name || '');
                res.status(status.OK).json('Logged in!');
            } else
                res
                    .status(status.NOT_ACCEPTABLE)
                    .send('Invalid username or password.');
        });

})
// router.post('/login', async function (req, res) {
//     const { email, password } = {
//         email: req.body.email,
//         password: req.body.password,
//     };
//     pool.query(
//         'SELECT * FROM User WHERE email = ?',
//         email,
//         (error, results, fields) => {
//             if (error) res.status(status.INTERNAL_SERVER_ERROR).json(error);

//             if (!results || !results.length || !results[0])
//                 res.status(status.NOT_ACCEPTABLE).send('Invalid username or password.');
//             else
//                 bcrypt.compare(password, results[0].password, (err, response) => {
//                     if (err){
//                         res.status(status.INTERNAL_SERVER_ERROR).json(err)
//                         return 0;
//                     }

//                     if (response) {
//                         req.session.success = true;
//                         req.session.email = email;
//                         req.session.userId = results[0].id;

//                         res.cookie('email', results[0].email || '');
//                         res.cookie('name', results[0].name || '');
//                         res.status(status.OK).json('Logged in!');
//                     } else
//                         res
//                             .status(status.NOT_ACCEPTABLE)
//                             .send('Invalid username or password.');
//                 });
//         }
//     );
// })

module.exports = router;
