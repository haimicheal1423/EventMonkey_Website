import { Router } from 'express';
import status from "http-status";

import { EventManager } from "../helpers/EventManager.js";
import { emDBSource } from "../helpers/Database.js";

export const eventManager = new EventManager(emDBSource);
export const router = Router();

router.get('/',
    (req, res) => getAllEventMonkeyEvents(req, res)
);

router.get('/search',
    (req, res) => searchEvent(req, res)
);

router.get('/:eventId',
    (req, res) => getEventById(req, res)
);

router.get('/recommended/:userId',
    (req, res) => getRecommendedEvents(req, res)
);

async function getAllEventMonkeyEvents(req, res) {
    try {
        const events = await eventManager.getAllEvents();
        res.status(status.OK).json(events);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message)
        console.error(error);
    }
}

async function searchEvent(req, res) {
    try {
        const searchRequest = {};

        if (req.query['source']) {
            searchRequest.source = req.query['source'];
        }

        if (req.query['limit']) {
            searchRequest.limit = req.query['limit'];
        }

        if (req.query['genres']) {
            searchRequest.genres = req.query['genres'];
        }

        if (req.query['keyword']) {
            searchRequest.keyword = req.query['keyword'];
        }

        const result = await eventManager.search(searchRequest);

        res.status(status.OK).json(result);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
        console.error(error);
    }
}

async function getEventById(req, res) {
    try {
        const eventId = Number(req.params['eventId']);
        const source = req.query['source'];
        const result = await eventManager.findEventById({ source, eventId });
        res.status(status.OK).json(result);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
        console.error(error);
    }
}

async function getRecommendedEvents(req, res) {
    try {
        const userId = Number(req.params['userId']);
        let limit = Number(req.query['limit']);

        if (isNaN(limit)) {
            limit = undefined;
        }

        const result = await eventManager.getRecommendedEvents(userId, limit);
        res.status(status.OK).json(result);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error.message);
        console.error(error);
    }
}
