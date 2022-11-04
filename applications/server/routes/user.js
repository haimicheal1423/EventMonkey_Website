import { Router } from 'express';
import bcrypt from 'bcrypt';

import { query as queryDB } from '../helpers/Database.js';

export const router = Router();

router.get('/', async function(req, res) {
    try {
        const sqlQuery = 'SELECT * FROM User';
        const rows = await queryDB(sqlQuery, req.params);
        res.status(200).json(rows);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get('/:id', async function(req, res) {
    try {
        const sqlQuery = 'SELECT user_id, email, password FROM User WHERE user_id=?';
        const rows = await queryDB(sqlQuery, req.params.id);
        res.status(200).json(rows);
    } catch (error) {
        res.status(400).send(error.message);
    }
    // try {
    //     const sqlQuery = 'SELECT user_id, email, password FROM User WHERE user_id=?';
    //     const rows = await queryDB(sqlQuery, req.params.id);
    //     res.status(200).json(rows);
    // } catch (error) {
    //     res.status(400).send(error.message);
    // }
});

// router.get('/:id', async function(req, res) {
//     try {
//         const sqlQuery = 'SELECT event_id, name, dates FROM Event WHERE event_id=?';
//         const rows = await queryDB(sqlQuery, req.params.id);
//         res.status(200).json(rows);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
//     res.status(200).json({ id: req.params.id });
// });

// router.get('/:id', (req, res) => {
//     res.status(200).json({ id: req.params.id });
// });

// router.post('/register', async function(req, res) {
//     try {
//         const { email, password } = req.body;
//         const encryptedPassword = await bcrypt.hash(password, 10);
//         const sqlQuery = 'INSERT INTO User (email, password) VALUES (?,?)';
//         const result = await queryDB(sqlQuery, [email, encryptedPassword]);
//         res.status(200).json({ userId: result.insertId });
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// router.post('/login', async function(req, res) {
//     try {
//         const { id, password } = req.body;
//         const sqlGetUser = 'SELECT password FROM User WHERE Id=?';
//         const rows = await queryDB(sqlGetUser, id);
//         if (rows) {
//             const isValid = await bcrypt.compare(password, rows[0].password);
//             res.status(200).json({ valid_password: isValid });
//         }
//         res.status(200).send(`User with id ${id} was not found`);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });
