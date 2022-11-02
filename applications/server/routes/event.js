const express = require('express');
const router = express.Router();
const database = require('../helpers/Database');

const eventGenreSqlQuery =
    `SELECT event.*, class.*
     FROM Genre genre
     JOIN Classification class
     ON genre.id = class.segment_id
        OR genre.id = class.genre_id
        OR genre.id = class.subgenre_id
     JOIN Event_Classification_List ec
     USING (class_id)
     JOIN Event event
     USING (event_id)
     WHERE genre.name = ?`;

const allEventsSqlQuery =
    `SELECT event.*, class.*
     FROM Genre genre
     JOIN Classification class
     JOIN Event_Classification_List ec
     USING (class_id)
     JOIN Event event
     USING (event_id)
     GROUP BY event_id`;

router.get('/', function(req, res) {
    try {
        const rows = database.query(allEventsSqlQuery);
        res.status(200).json(rows);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// router.get('/:id', async function(req, res) {
//     try {
//         const sqlQuery = 'SELECT event_id, name, dates FROM Event WHERE event_id=?';
//         const rows = await database.query(sqlQuery, req.params.id);
//         res.status(200).json(rows);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

router.get('/:genre', function(req, res, next) {
    try {
        const rows = database.query(eventGenreSqlQuery, req.params.genre);
        if (rows && rows.length > 0) {
            res.status(200).json(rows);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
