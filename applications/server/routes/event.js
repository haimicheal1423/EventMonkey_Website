const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");

const eventGenreSqlQuery =
  `select event.*, class.*
   from Genre genre
   join Classification class
   on genre.id = class.segment_id or genre.id = class.genre_id or genre.id = class.subgenre_id
   join Event_Classification_List ec
   using (class_id)
   join Event event
   using (event_id)
   where genre.name = ?`;

const allEventsSqlQuery =
  `select event.*, class.*
   from Genre genre
   join Classification class
   join Event_Classification_List ec
   using (class_id)
   join Event event
   using (event_id)
   group by event_id`;

router.get("/", async function(req, res){
    try{
        const rows = await pool.query(allEventsSqlQuery);
        res.status(200).json(rows);
    } catch (error){
        res.status(400).send(error.message);
    }
});
// router.get("/:id", async function(req, res){
//     try{
//         const sqlQuery = "SELECT event_id, name, dates FROM Event WHERE event_id=?";
//         const rows = await pool.query(sqlQuery, req.params.id);
//         res.status(200).json(rows);
//     } catch (error){
//         res.status(400).send(error.message);
//     }
// });

router.get("/:genre", async function(req, res, next){
    try{
        const rows = await pool.query(eventGenreSqlQuery, req.params.genre);
        if (rows && rows.length > 0) {
        res.status(200).json(rows);
        }
    } catch (error){
        res.status(400).send(error.message);
    }
});

// router.post("/", async(req, res)=>{
//     let emp = req.body;


// })

module.exports = router;