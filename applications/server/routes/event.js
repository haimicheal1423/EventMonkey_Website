const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");

router.get("/", async function(req, res){
    try{
        const sqlQuery = "SELECT * FROM Event";
        const rows = await pool.query(sqlQuery, req.params);
        res.status(200).json(rows);
    } catch (error){
        res.status(400).send(error.message);
    }
});
router.get("/:id", async function(req, res){
    try{
        const sqlQuery = "SELECT event_id, name, dates FROM Event WHERE event_id=?";
        const rows = await pool.query(sqlQuery, req.params.id);
        res.status(200).json(rows);
    } catch (error){
        res.status(400).send(error.message);
    }
});

router.get("/:id", async function(req, res){
    try{
        const sqlQuery = "SELECT event.* FROM Genre genre JOIN Classification class ON genre.id=class.segment_id OR genre.id=class.genre_id OR genre.id=class.subgenre_id JOIN Event_Classification_List ecl ON class.class_id = ecl.class_id JOIN Event event ON ecl.event_id=event.event_id WHERE genre.name = ?";
        const rows = await pool.query(sqlQuery, req.params.id);
        res.status(200).json(rows);
    } catch (error){
        res.status(400).send(error.message);
    }
});

module.exports = router;