<<<<<<< HEAD
<<<<<<< HEAD
import express, {Router} from "express";
import { Database } from "../helpers/Database.js";
import {EventManager} from "../helpers/EventManager.js";
export const router =  Router();


=======
import { Router } from 'express';

import { EventManager } from "../helpers/EventManager.js";

export const router = Router();
>>>>>>> d85e5926cebcadb040ffa44638413236dd4f7412

const eventManager = new EventManager();

router.get('/', async function(req,res){
    try {
        const sqlQuery = 'SELECT * FROM Event';
        const rows = await Database.query(sqlQuery, req.params.id);
        res.status(200).json(rows);
    } catch (error) {
        res.status(400).send(error.message)
    }
});
=======
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

// router.get("/:id", async function(req, res, next){
//     try{
//         const rows = await pool.query(allEventsSqlQuery, req.params.id);
//         if (rows && rows.length > 0) {
//         res.status(200).json(rows);
//         }
//     } catch (error){
//         res.status(400).send(error.message);
//     }
// });


const eventManager = new EventManager();
>>>>>>> origin/robin

router.get('/', async function(req, res) {
    try {
        const searchRequest = {};

        if (req.query.source) {
            searchRequest.source = req.query.source;
        }

        if (req.query.limit) {
            searchRequest.limit = req.query.limit;
        }

        if (req.query.eventId) {
            searchRequest.eventId = req.query.eventId;
        }

        if (req.query.genre) {
            searchRequest.genre = req.query.genre;
        }

        if (req.query.userId) {
            searchRequest.userId = req.query.userId;
        }

        if (req.query.keyword) {
            searchRequest.keyword = req.query.keyword;
        }

        const result = await eventManager.search(searchRequest);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

<<<<<<< HEAD
router.post('/create', async function(req, res) {
    try {
        if (!req.query.userId) {
            res.status(400).send('No user id found');
            return;
        }

        const userId = req.query.userId;
        const name = req.body.name;
        const description = req.body.description;
        const dates = req.body.dates;
        const priceRanges = req.body.priceRanges;
        const genres = req.body.genres;
        const images = req.body.images;

        const eventId = await eventManager.createEvent(
            userId,
            name,
            description,
            dates,
            priceRanges,
            genres,
            images
        );

        res.status(200).json({ eventId });
    } catch (error) {
        res.status(400).send(error.message);
    }
=======
router.get('/create', async function(req, res) {
    res.status(200);
>>>>>>> origin/robin
});
