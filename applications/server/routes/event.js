import { Router } from 'express';

import { Database } from '../helpers/Database.js'

export const router = Router();

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

router.get('/', async function(req, res) {
    try {
        let rows;
        if (req.query.genre) {
            rows = await Database.query(eventGenreSqlQuery, req.query.genre);
        } else {
            rows = await Database.query(allEventsSqlQuery);
        }
        res.status(200).json(rows);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get('/create', async function(req, res) {
    res.status(200);
});
