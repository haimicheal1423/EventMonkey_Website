import { Database } from "../helpers/Database.js";
import express, {Router} from "express";
import bcrypt from "bcrypt";
import status from "http-status";


export const router = Router();
router.get("/", async function (req, res) {
    try {
        const sqlQuery = 'SELECT * FROM User';
        const rows = await Database.query(sqlQuery, req.params);
        res.status(200).json(rows);
    } catch (error) {
        res.status(400).send(error.message);
    }
})
router.get('/:id', async function (req, res) {
    try {
        const sqlQuery = 'SELECT user_id, email, password FROM User WHERE user_id=?';

        const rows = await Database.query(sqlQuery, req.params.id);
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
        const result = await Database.query(sqlQuery, [type, username, email, encryptedPassword]);

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
    const results = await Database.query('SELECT * FROM User WHERE email = ?', [email]);

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

