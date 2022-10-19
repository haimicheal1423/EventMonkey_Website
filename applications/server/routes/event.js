const express = require("express");
const router = express.Router();
const pool = require("../helpers/database");

router.get("/events", async function(req, res){
    try{
        const sqlQuery = "SELECT * FROM Event";
        const rows = await pool.query(sqlQuery, req.params.id);
        res.status(200).json(rows);
    } catch (error){
        res.status(400).send(error.message);
    }
    res.status(200).json({id:req.params.id});
})
router.get("/events/:id", async function(req, res){
    try{
        const sqlQuery = "SELECT event_id, name, dates FROM Event WHERE event_id=?";
        const rows = await pool.query(sqlQuery, req.params.id);
        res.status(200).json(rows);
    } catch (error){
        res.status(400).send(error.message);
    }
    res.status(200).json({id:req.params.id});
})

module.exports = router;