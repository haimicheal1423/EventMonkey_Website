import { Router } from 'express';

import { EventManager } from "../helpers/EventManager.js";

export const router = Router();

const eventManager = new EventManager();

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
});
